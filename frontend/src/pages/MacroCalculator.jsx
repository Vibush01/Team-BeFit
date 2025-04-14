import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MacroCalculator = () => {
    const { user } = useContext(AuthContext);
    const [macroLogs, setMacroLogs] = useState([]);
    const [formData, setFormData] = useState({
        food: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
    });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchMacroLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/member/macros', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMacroLogs(res.data);
            } catch (err) {
                setError('Failed to fetch macro logs');
            }
        };
        if (user?.role === 'member') {
            fetchMacroLogs();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                food: formData.food,
                macros: {
                    calories: parseFloat(formData.calories) || 0,
                    protein: parseFloat(formData.protein) || 0,
                    carbs: parseFloat(formData.carbs) || 0,
                    fats: parseFloat(formData.fats) || 0,
                },
            };

            // Validate inputs
            if (!data.food || isNaN(data.macros.calories) || isNaN(data.macros.protein) || isNaN(data.macros.carbs) || isNaN(data.macros.fats)) {
                throw new Error('All fields are required and must be valid numbers');
            }

            if (editId) {
                // Update existing log
                const res = await axios.put(`http://localhost:5000/api/member/macros/${editId}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMacroLogs(macroLogs.map((log) => (log._id === editId ? res.data : log)));
                setSuccess('Macro log updated successfully');
                setEditId(null);
            } else {
                // Create new log
                const res = await axios.post('http://localhost:5000/api/member/macros', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMacroLogs([res.data, ...macroLogs]);
                setSuccess('Macro log added successfully');
            }

            // Reset form
            setFormData({ food: '', calories: '', protein: '', carbs: '', fats: '' });
        } catch (err) {
            setError(err.message || 'Failed to save macro log');
        }
    };

    const handleEdit = (log) => {
        setEditId(log._id);
        setFormData({
            food: log.food,
            calories: log.macros.calories.toString(),
            protein: log.macros.protein.toString(),
            carbs: log.macros.carbs.toString(),
            fats: log.macros.fats.toString(),
        });
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/member/macros/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMacroLogs(macroLogs.filter((log) => log._id !== id));
            setSuccess('Macro log deleted successfully');
        } catch (err) {
            setError('Failed to delete macro log');
        }
    };

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Macro Calculator</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700">Food</label>
                                <input
                                    type="text"
                                    name="food"
                                    value={formData.food}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Calories (kcal)</label>
                                <input
                                    type="number"
                                    name="calories"
                                    value={formData.calories}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Protein (g)</label>
                                <input
                                    type="number"
                                    name="protein"
                                    value={formData.protein}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Carbs (g)</label>
                                <input
                                    type="number"
                                    name="carbs"
                                    value={formData.carbs}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Fats (g)</label>
                                <input
                                    type="number"
                                    name="fats"
                                    value={formData.fats}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                    step="0.1"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            {editId ? 'Update Macro Log' : 'Add Macro Log'}
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Macro Logs</h2>
                    {macroLogs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Food</th>
                                        <th className="p-2">Calories (kcal)</th>
                                        <th className="p-2">Protein (g)</th>
                                        <th className="p-2">Carbs (g)</th>
                                        <th className="p-2">Fats (g)</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {macroLogs.map((log) => (
                                        <tr key={log._id} className="border-t">
                                            <td className="p-2">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="p-2">{log.food}</td>
                                            <td className="p-2">{log.macros.calories}</td>
                                            <td className="p-2">{log.macros.protein}</td>
                                            <td className="p-2">{log.macros.carbs}</td>
                                            <td className="p-2">{log.macros.fats}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleEdit(log)}
                                                    className="bg-yellow-600 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(log._id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No macro logs yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MacroCalculator;