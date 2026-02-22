import type { MenuItem, Table } from '../types';

export const mockMenuItems: MenuItem[] = [
    // === APPETIZERS ===
    {
        id: 'm1',
        name: 'Beef Truffle Sliders',
        description: 'Three mini wagyu beef patties with truffle aioli, aged cheddar, and caramelized onions on brioche buns.',
        price: 18.00,
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Wagyu Beef', 'Truffle Oil', 'Cheddar', 'Onions', 'Brioche', 'Mayo'],
        dietaryTags: ['nut-free'],
        category: 'appetizer',
        available: true,
        allergens: ['dairy', 'gluten', 'eggs']
    },
    {
        id: 'm2',
        name: 'Mediterranean Mezze Platter',
        description: 'A selection of hummus, baba ganoush, falafel, kalamata olives, and fresh pita bread.',
        price: 17.50,
        imageUrl: 'https://images.unsplash.com/photo-1548943487-a2e4d43b4849?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Chickpeas', 'Eggplant', 'Tahini', 'Olives', 'Pita', 'Olive Oil'],
        dietaryTags: ['vegan', 'vegetarian', 'halal', 'kosher'],
        category: 'appetizer',
        available: true,
        allergens: ['sesame', 'gluten']
    },
    {
        id: 'm3',
        name: 'Tuna Tartare Tower',
        description: 'Fresh ahi tuna with avocado, sesame soy dressing, crispy wonton chips, and microgreens.',
        price: 19.00,
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Ahi Tuna', 'Avocado', 'Soy Sauce', 'Sesame Oil', 'Wonton', 'Wasabi'],
        dietaryTags: ['dairy-free', 'nut-free'],
        category: 'appetizer',
        available: true,
        allergens: ['fish', 'soy', 'sesame', 'gluten']
    },
    {
        id: 'm4',
        name: 'Vegan Spring Rolls',
        description: 'Crispy rice paper rolls filled with fresh vegetables, tofu, and served with sweet chili sauce.',
        price: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-831eabc92244?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Rice Paper', 'Tofu', 'Carrots', 'Cucumber', 'Mint', 'Sweet Chili'],
        dietaryTags: ['vegan', 'vegetarian', 'dairy-free', 'nut-free', 'gluten-free'],
        category: 'appetizer',
        available: true,
        allergens: ['soy']
    },

    // === MAIN COURSES ===
    {
        id: 'm5',
        name: 'Spicy Thai Basil Chicken',
        description: 'Ground chicken stir-fried with Thai holy basil, garlic, and chili peppers. Served over jasmine rice.',
        price: 16.50,
        imageUrl: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Chicken', 'Thai Basil', 'Garlic', 'Chili', 'Soy Sauce', 'Jasmine Rice'],
        dietaryTags: ['dairy-free', 'nut-free'],
        category: 'main',
        available: true,
        allergens: ['soy']
    },
    {
        id: 'm6',
        name: 'Vegan Buddha Bowl',
        description: 'A nourishing bowl of quinoa, roasted sweet potatoes, crispy chickpeas, kale, and tahini dressing.',
        price: 14.00,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Quinoa', 'Sweet Potatoes', 'Chickpeas', 'Kale', 'Tahini', 'Lemon'],
        dietaryTags: ['vegan', 'vegetarian', 'dairy-free', 'gluten-free', 'nut-free'],
        category: 'main',
        available: true,
        allergens: ['sesame']
    },
    {
        id: 'm7',
        name: 'Gluten-Free Pad Thai',
        description: 'Classic Pad Thai made with rice noodles, tofu, egg, bean sprouts, peanuts, and tamarind sauce.',
        price: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Rice Noodles', 'Tofu', 'Egg', 'Bean Sprouts', 'Peanuts', 'Tamarind'],
        dietaryTags: ['vegetarian', 'gluten-free', 'dairy-free'],
        category: 'main',
        available: true,
        allergens: ['nuts', 'eggs', 'soy']
    },
    {
        id: 'm8',
        name: 'Herb-Crusted Salmon',
        description: 'Atlantic salmon with lemon dill crust, served with roasted asparagus and garlic mashed potatoes.',
        price: 26.00,
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Salmon', 'Dill', 'Lemon', 'Asparagus', 'Potatoes', 'Garlic'],
        dietaryTags: ['gluten-free', 'nut-free', 'keto'],
        category: 'main',
        available: true,
        allergens: ['fish', 'dairy']
    },
    {
        id: 'm9',
        name: 'Chicken Shawarma Plate',
        description: 'Marinated chicken thighs with turmeric rice, garlic sauce, pickles, and fresh salad. Halal certified.',
        price: 18.00,
        imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Chicken', 'Turmeric Rice', 'Garlic Sauce', 'Pickles', 'Tomatoes', 'Lettuce'],
        dietaryTags: ['halal', 'nut-free', 'dairy-free'],
        category: 'main',
        available: true,
        allergens: []
    },
    {
        id: 'm10',
        name: 'Mushroom Risotto',
        description: 'Creamy arborio rice with wild mushrooms, truffle oil, parmesan, and fresh herbs.',
        price: 20.00,
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Arborio Rice', 'Wild Mushrooms', 'Truffle Oil', 'Parmesan', 'White Wine', 'Thyme'],
        dietaryTags: ['vegetarian', 'gluten-free', 'nut-free'],
        category: 'main',
        available: true,
        allergens: ['dairy']
    },
    {
        id: 'm11',
        name: 'Kosher Ribeye Steak',
        description: '12oz prime ribeye, dry-aged 28 days, served with roasted vegetables and red wine reduction.',
        price: 42.00,
        imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Ribeye Beef', 'Rosemary', 'Garlic', 'Red Wine', 'Carrots', 'Potatoes'],
        dietaryTags: ['kosher', 'gluten-free', 'dairy-free', 'nut-free', 'keto'],
        category: 'main',
        available: true,
        allergens: []
    },
    {
        id: 'm12',
        name: 'Keto Cauliflower Steak',
        description: 'Roasted cauliflower steak with chimichurri, avocado crema, and toasted pepitas.',
        price: 16.00,
        imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Cauliflower', 'Chimichurri', 'Avocado', 'Pepitas', 'Olive Oil', 'Lime'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'keto'],
        category: 'main',
        available: true,
        allergens: []
    },

    // === DESSERTS ===
    {
        id: 'm13',
        name: 'Matcha Panna Cotta',
        description: 'Creamy vegan matcha-infused dessert topped with fresh berries and toasted coconut.',
        price: 9.50,
        imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Matcha Powder', 'Coconut Milk', 'Agar Agar', 'Vanilla', 'Berries', 'Coconut Flakes'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'halal'],
        category: 'dessert',
        available: true,
        allergens: []
    },
    {
        id: 'm14',
        name: 'Classic Tiramisu',
        description: 'Layers of espresso-soaked ladyfingers with mascarpone cream and cocoa dusting.',
        price: 11.00,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Ladyfingers', 'Mascarpone', 'Espresso', 'Cocoa', 'Eggs', 'Sugar'],
        dietaryTags: ['vegetarian', 'nut-free'],
        category: 'dessert',
        available: true,
        allergens: ['dairy', 'gluten', 'eggs']
    },
    {
        id: 'm15',
        name: 'Flourless Chocolate Torte',
        description: 'Rich, dense chocolate cake made without flour. Topped with raspberry coulis.',
        price: 10.00,
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Raspberries'],
        dietaryTags: ['gluten-free', 'vegetarian', 'nut-free'],
        category: 'dessert',
        available: true,
        allergens: ['dairy', 'eggs']
    },
    {
        id: 'm16',
        name: 'Vegan Coconut Ice Cream',
        description: 'House-made coconut ice cream with toasted macadamia nuts and passion fruit drizzle.',
        price: 8.00,
        imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Coconut Milk', 'Macadamia Nuts', 'Passion Fruit', 'Vanilla', 'Agave'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
        category: 'dessert',
        available: true,
        allergens: ['nuts']
    },

    // === BEVERAGES ===
    {
        id: 'm17',
        name: 'Artisan Iced Coffee',
        description: 'Cold-brewed Arabica coffee with oat milk and a hint of vanilla syrup.',
        price: 5.50,
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Coffee', 'Oat Milk', 'Vanilla', 'Ice'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'],
        category: 'beverage',
        available: true,
        allergens: []
    },
    {
        id: 'm18',
        name: 'Fresh Mint Lemonade',
        description: 'House-made lemonade with fresh mint leaves and a touch of honey.',
        price: 4.50,
        imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Lemon', 'Mint', 'Honey', 'Sparkling Water'],
        dietaryTags: ['vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'],
        category: 'beverage',
        available: true,
        allergens: []
    },
    {
        id: 'm19',
        name: 'Golden Turmeric Latte',
        description: 'Warm almond milk infused with turmeric, ginger, cinnamon, and black pepper.',
        price: 6.00,
        imageUrl: 'https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Almond Milk', 'Turmeric', 'Ginger', 'Cinnamon', 'Black Pepper', 'Honey'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'halal'],
        category: 'beverage',
        available: true,
        allergens: ['nuts']
    },
    {
        id: 'm20',
        name: 'Sparkling Elderflower',
        description: 'Refreshing elderflower cordial with sparkling water and fresh cucumber slices.',
        price: 5.00,
        imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=600&auto=format&fit=crop',
        ingredients: ['Elderflower Cordial', 'Sparkling Water', 'Cucumber', 'Lime'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher'],
        category: 'beverage',
        available: true,
        allergens: []
    }
];
// Mock table data for 3D floor plan visualization
export const mockTables: Table[] = [
    // Row 1 - Window side (round tables for 2-4)
    {
        id: 'table-1',
        number: 1,
        capacity: 2,
        status: 'available',
        position: { x: -6, y: 0, z: -4 },
        shape: 'round',
        lastUpdated: new Date()
    },
    {
        id: 'table-2',
        number: 2,
        capacity: 2,
        status: 'reserved',
        position: { x: -3, y: 0, z: -4 },
        shape: 'round',
        reservationDetails: {
            customerName: 'Johnson',
            partySize: 2,
            reservationTime: new Date(Date.now() + 3600000)
        },
        lastUpdated: new Date()
    },
    {
        id: 'table-3',
        number: 3,
        capacity: 4,
        status: 'occupied',
        position: { x: 0, y: 0, z: -4 },
        shape: 'round',
        lastUpdated: new Date()
    },
    {
        id: 'table-4',
        number: 4,
        capacity: 2,
        status: 'available',
        position: { x: 3, y: 0, z: -4 },
        shape: 'round',
        lastUpdated: new Date()
    },
    {
        id: 'table-5',
        number: 5,
        capacity: 2,
        status: 'cleaning',
        position: { x: 6, y: 0, z: -4 },
        shape: 'round',
        lastUpdated: new Date()
    },

    // Row 2 - Center (square tables for 4)
    {
        id: 'table-6',
        number: 6,
        capacity: 4,
        status: 'available',
        position: { x: -4.5, y: 0, z: 0 },
        shape: 'square',
        lastUpdated: new Date()
    },
    {
        id: 'table-7',
        number: 7,
        capacity: 4,
        status: 'occupied',
        position: { x: -1.5, y: 0, z: 0 },
        shape: 'square',
        lastUpdated: new Date()
    },
    {
        id: 'table-8',
        number: 8,
        capacity: 4,
        status: 'reserved',
        position: { x: 1.5, y: 0, z: 0 },
        shape: 'square',
        reservationDetails: {
            customerName: 'Williams',
            partySize: 3,
            reservationTime: new Date(Date.now() + 7200000)
        },
        lastUpdated: new Date()
    },
    {
        id: 'table-9',
        number: 9,
        capacity: 4,
        status: 'available',
        position: { x: 4.5, y: 0, z: 0 },
        shape: 'square',
        lastUpdated: new Date()
    },

    // Row 3 - Back wall (rectangular tables for 6-8)
    {
        id: 'table-10',
        number: 10,
        capacity: 6,
        status: 'available',
        position: { x: -4, y: 0, z: 4 },
        shape: 'rectangle',
        lastUpdated: new Date()
    },
    {
        id: 'table-11',
        number: 11,
        capacity: 8,
        status: 'reserved',
        position: { x: 0, y: 0, z: 4 },
        shape: 'rectangle',
        reservationDetails: {
            customerName: 'Smith Family',
            partySize: 7,
            reservationTime: new Date(Date.now() + 5400000)
        },
        lastUpdated: new Date()
    },
    {
        id: 'table-12',
        number: 12,
        capacity: 6,
        status: 'occupied',
        position: { x: 4, y: 0, z: 4 },
        shape: 'rectangle',
        lastUpdated: new Date()
    }
];