import type { Category } from '../types';
import { CodeBracketIcon, PaintBrushIcon, BriefcaseIcon, HeartIcon, TagIcon } from '../components/icons';

export const categories: Category[] = [
    {
        id: 'c1',
        name: 'Technology',
        icon: CodeBracketIcon,
        color: 'sky',
    },
    {
        id: 'c2',
        name: 'Creative Arts',
        icon: PaintBrushIcon,
        color: 'purple',
    },
    {
        id: 'c3',
        name: 'Business',
        icon: BriefcaseIcon,
        color: 'emerald',
    },
    {
        id: 'c4',
        name: 'Lifestyle',
        icon: HeartIcon,
        color: 'rose',
    },
    {
        id: 'c5',
        name: 'User-Defined',
        icon: TagIcon,
        color: 'slate',
    }
];