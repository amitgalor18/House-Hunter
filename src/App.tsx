import React, { useState, useRef } from 'react';
import { Sliders, Home, List, Download, Upload, Edit2, MessageSquare } from 'lucide-react';

interface House {
  id: string;
  title: string;
  scores: { [key: string]: number };
  comments?: string;
}

interface Category {
  id: string;
  name: string;
  weight: number;
}

const categories: Category[] = [
  { id: 'location', name: 'מיקום', weight: 1 },
  { id: 'building', name: 'בניין', weight: 1 },
  { id: 'floor', name: 'קומה', weight: 1 },
  { id: 'view', name: 'נוף', weight: 1 },
  { id: 'proximity', name: 'קרבה למוסדות חינוך מסחר ותרבות', weight: 1 },
  { id: 'rooms', name: 'מספר חדרים', weight: 1 },
  { id: 'roomSize', name: 'גודל חדרים', weight: 1 },
  { id: 'livingSpace', name: 'גודל מרחב אירוח ואוכל', weight: 1 },
  { id: 'masterBedroom', name: 'יחידת הורים', weight: 1 },
  { id: 'elevator', name: 'מעלית', weight: 1 },
  { id: 'neighborhood', name: 'שכונה', weight: 1 },
  { id: 'buildingAge', name: 'גיל הבניין', weight: 1 },
  { id: 'bathrooms', name: 'מספר שירותים/מקלחות', weight: 1 },
  { id: 'neighbors', name: 'שכנים', weight: 1 },
  { id: 'parking', name: 'חניה', weight: 1 },
  { id: 'shelter', name: 'ממ״ד', weight: 1 },
  { id: 'storage', name: 'מחסן', weight: 1 },
  { id: 'balcony', name: 'מרפסת', weight: 1 },
];

function App() {
  const [houses, setHouses] = useState<House[]>([]);
  const [weights, setWeights] = useState<{ [key: string]: number }>(
    Object.fromEntries(categories.map(cat => [cat.id, cat.weight]))
  );
  const [newHouseTitle, setNewHouseTitle] = useState('');
  const [newHouseScores, setNewHouseScores] = useState<{ [key: string]: number }>(
    Object.fromEntries(categories.map(cat => [cat.id, 3]))
  );
  const [comments, setComments] = useState('');
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateScore = (house: House) => {
    const totalPossibleScore = Object.values(weights).reduce((a, b) => a + b, 0) * 5;
    const actualScore = Object.entries(house.scores).reduce(
      (sum, [category, score]) => sum + score * weights[category],
      0
    );
    return (actualScore / totalPossibleScore) * 100;
  };

  const addOrUpdateHouse = () => {
    if (!newHouseTitle) return;
    
    const houseData: House = {
      id: editingHouse?.id || Date.now().toString(),
      title: newHouseTitle,
      scores: { ...newHouseScores },
      comments,
    };
    
    if (editingHouse) {
      setHouses(prev => prev.map(h => h.id === editingHouse.id ? houseData : h));
    } else {
      setHouses(prev => [...prev, houseData]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setNewHouseTitle('');
    setNewHouseScores(Object.fromEntries(categories.map(cat => [cat.id, 3])));
    setComments('');
    setEditingHouse(null);
  };

  const editHouse = (house: House) => {
    setEditingHouse(house);
    setNewHouseTitle(house.title);
    setNewHouseScores(house.scores);
    setComments(house.comments || '');
  };

  const exportData = () => {
    const data = {
      weights,
      houses,
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'text/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'house-hunters-data.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setWeights(data.weights);
        setHouses(data.houses);
      } catch (error) {
        alert('קובץ לא תקין');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">House Hunters 2.0</h1>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              ייצוא נתונים
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              ייבוא נתונים
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={importData}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Houses List */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <List className="w-5 h-5" />
              <h2 className="text-xl font-semibold">דירות</h2>
            </div>
            <div className="space-y-3">
              {houses.sort((a, b) => calculateScore(b) - calculateScore(a)).map(house => (
                <div key={house.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => editHouse(house)}
                      className="flex items-center gap-2 font-medium hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {house.title}
                    </button>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {calculateScore(house).toFixed(1)}%
                    </span>
                  </div>
                  {house.comments && (
                    <div className="mt-2 text-sm text-gray-600 flex items-start gap-1">
                      <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                      <p>{house.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Category Weights */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5" />
              <h2 className="text-xl font-semibold">משקל קטגוריות</h2>
            </div>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="space-y-1">
                  <label className="text-sm font-medium">{category.name}</label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={weights[category.id]}
                    onChange={e => setWeights(prev => ({
                      ...prev,
                      [category.id]: parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-left">{weights[category.id]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Add/Edit House */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5" />
              <h2 className="text-xl font-semibold">{editingHouse ? 'עריכת בית' : 'בית חדש'}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">כותרת</label>
                <input
                  type="text"
                  value={newHouseTitle}
                  onChange={e => setNewHouseTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="שם או כתובת"
                />
              </div>
              
              {categories.map(category => (
                <div key={category.id} className="space-y-2">
                  <label className="block text-sm font-medium">{category.name}</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(score => (
                      <label key={score} className="flex-1">
                        <input
                          type="radio"
                          name={`score-${category.id}`}
                          value={score}
                          checked={newHouseScores[category.id] === score}
                          onChange={() => setNewHouseScores(prev => ({
                            ...prev,
                            [category.id]: score
                          }))}
                          className="sr-only peer"
                        />
                        <div className="text-center p-2 border rounded-lg cursor-pointer 
                                    peer-checked:bg-blue-500 peer-checked:text-white 
                                    hover:bg-blue-50 transition-colors">
                          {score}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1">הערות</label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="w-full p-2 border rounded-lg h-24 resize-none"
                  placeholder="הערות נוספות..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={addOrUpdateHouse}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newHouseTitle}
                >
                  {editingHouse ? 'עדכן בית' : 'הוסף בית'}
                </button>
                {editingHouse && (
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 
                             transition-colors"
                  >
                    ביטול
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;