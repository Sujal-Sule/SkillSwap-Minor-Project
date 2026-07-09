import os
import time
import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/turn", tags=["turn"])

# Cache TURN credentials to avoid hitting the API on every request
_cached_credentials = None
_cache_expiry = 0
CACHE_TTL = 12 * 3600  # 12 hours


# Free public STUN/TURN servers as fallback
FALLBACK_ICE_SERVERS = [
    {"urls": "stun:stun.l.google.com:19302"},
    {"urls": "stun:stun1.l.google.com:19302"},
    {
        "urls": [
            "turn:openrelay.metered.ca:80",
            "turn:openrelay.metered.ca:443",
            "turns:openrelay.metered.ca:443",
            "turn:openrelay.metered.ca:80?transport=tcp",
        ],
        "username": "openrelayproject",
        "credential": "openrelayproject",
    },
]


@router.get("/credentials")
async def get_turn_credentials():
    """
    Returns ICE server configuration including STUN and TURN servers.
    If a Metered.ca API key is configured, fetches temporary credentials.
    Otherwise, returns free public relay servers.
    """
    global _cached_credentials, _cache_expiry

    api_key = os.getenv("METERED_API_KEY")

    if not api_key:
        # Use free public TURN relay servers
        return {"iceServers": FALLBACK_ICE_SERVERS}

    # Check cache
    now = time.time()
    if _cached_credentials and now < _cache_expiry:
        return {"iceServers": _cached_credentials}

    # Fetch from Metered.ca API
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://skill-swap.metered.live/api/v1/turn/credentials?apiKey={api_key}"
            )
            response.raise_for_status()
            servers = response.json()

            # Add Google STUN as a reliable fallback
            ice_servers = [
                {"urls": "stun:stun.l.google.com:19302"},
                {"urls": "stun:stun1.l.google.com:19302"},
            ]
            for server in servers:
                ice_servers.append(server)

            _cached_credentials = ice_servers
            _cache_expiry = now + CACHE_TTL
            return {"iceServers": ice_servers}

    except Exception as e:
        print(f"TURN credential fetch failed: {e}, using fallback")
        return {"iceServers": FALLBACK_ICE_SERVERS}
