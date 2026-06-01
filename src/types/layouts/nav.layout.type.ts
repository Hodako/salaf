import { LucideIcon } from 'lucide-react';

export type BaseNavAction = {
    id: number;
    icon: LucideIcon;
    label: string;
};

export type NavAction = BaseNavAction & (
    | { action: () => void; href?: never }
    | { action?: never; href: string }
    | { action?: never; href?: never }
);