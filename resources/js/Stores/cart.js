import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(
    persist(
        (set) => ({
            items: [],
            addItem: (item) =>
                set((s) => {
                    const key = `${item.productId}:${item.unitId}`;
                    const existing = s.items.find((i) => i.key === key);
                    
                    if (existing) {
                        const newQty = existing.qty + item.qty;
                        return {
                            items: s.items.map((i) =>
                                i.key === key
                                    ? { 
                                        ...i, 
                                        qty: newQty, 
                                        lineTotal: +(newQty * i.unitPrice).toFixed(2) 
                                      }
                                    : i
                            ),
                        };
                    }
                    
                    return {
                        items: [
                            ...s.items,
                            { 
                                ...item, 
                                key, 
                                lineTotal: +(item.qty * item.unitPrice).toFixed(2) 
                            },
                        ],
                    };
                }),
            removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
            setQty: (key, qty) =>
                set((s) => ({
                    items: s.items.map((i) =>
                        i.key === key ? { ...i, qty, lineTotal: +(qty * i.unitPrice).toFixed(2) } : i
                    ),
                })),
            clear: () => set({ items: [] }),
        }),
        { name: 'evopay-cart' }
    )
);