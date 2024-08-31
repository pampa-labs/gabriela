import React, { useState } from 'react';
import axios from 'axios';

interface MenuItem {
    name: string;
    description?: string;
    price: string;
}

const MenuInference: React.FC = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inferMenu = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/infer-menu', { url: imageUrl });
            setMenuItems(response.data.menu_items);
        } catch (err) {
            setError('Failed to infer menu. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="menu-inference">
            <h2>Menu Inference</h2>
            <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
            />
            <button onClick={inferMenu} disabled={loading}>
                {loading ? 'Inferring...' : 'Infer Menu'}
            </button>
            {error && <p className="error">{error}</p>}
            {menuItems.length > 0 && (
                <div className="menu-items">
                    <h3>Inferred Menu Items:</h3>
                    <ul>
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <strong>{item.name}</strong> - {item.price}
                                {item.description && <p>{item.description}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MenuInference;