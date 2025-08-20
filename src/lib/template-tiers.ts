
import type { Template } from '@/lib/types';

export type TemplateTier = {
    title: string;
    description: string;
    price?: number;
    usdPrice?: number;
    templates: { id: Template; name: string; type: 'free' | 'premium'}[];
};

export const templateTiers: TemplateTier[] = [
    {
        title: 'Free',
        description: 'Get started with our classic, professional template.',
        templates: [
            { id: 'classic', name: 'Classic', type: 'free' },
        ]
    },
    {
        title: 'Standard',
        description: 'Well-balanced templates for a variety of roles.',
        price: 400,
        usdPrice: 1.5,
        templates: [
            { id: 'modern', name: 'Modern', type: 'premium' },
            { id: 'creative', name: 'Creative', type: 'premium' },
            { id: 'professional', name: 'Professional', type: 'premium' },
            { id: 'minimalist', name: 'Minimalist', type: 'premium' },
            { id: 'executive', name: 'Executive', type: 'premium' },
        ]
    },
    {
        title: 'Premium',
        description: 'Elegant and bold designs to make you stand out.',
        price: 700,
        usdPrice: 2.5,
        templates: [
            { id: 'elegant', name: 'Elegant', type: 'premium' },
            { id: 'bold', name: 'Bold', type: 'premium' },
            { id: 'academic', name: 'Academic', type: 'premium' },
            { id: 'tech', name: 'Tech', type: 'premium' },
            { id: 'designer', name: 'Designer', type: 'premium' },
        ]
    },
    {
        title: 'Executive',
        description: 'Top-tier templates for leadership and artistic roles.',
        price: 900,
        usdPrice: 3,
        templates: [
            { id: 'corporate', name: 'Corporate', type: 'premium' },
            { id: 'artistic', name: 'Artistic', type: 'premium' },
            { id: 'sleek', name: 'Sleek', type: 'premium' },
            { id: 'vintage', name: 'Vintage', type: 'premium' },
            { id: 'premium-plus', name: 'Premium Plus', type: 'premium' },
        ]
    },
    {
        title: 'Platinum',
        description: 'Exclusive designs for the ultimate professional impression.',
        price: 1500,
        usdPrice: 5,
        templates: [
            { id: 'platinum', name: 'Platinum', type: 'premium' },
            { id: 'luxe', name: 'Luxe', type: 'premium' },
            { id: 'visionary', name: 'Visionary', type: 'premium' },
            { id: 'prestige', name: 'Prestige', type: 'premium' },
            { id: 'avant-garde', name: 'Avant-Garde', type: 'premium' },
        ]
    },
];
