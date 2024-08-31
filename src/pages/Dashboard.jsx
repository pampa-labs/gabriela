import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

const Dashboard = () => {
  const [userRole, setUserRole] = useState('admin');
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderStarted, setOrderStarted] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', image: null });
  const [menuImage, setMenuImage] = useState(null);

  useEffect(() => {
    const savedMenu = localStorage.getItem('restaurantMenu');
    if (savedMenu) {
      setMenuItems(JSON.parse(savedMenu));
    }
    const savedMenuImage = localStorage.getItem('menuImage');
    if (savedMenuImage) {
      setMenuImage(savedMenuImage);
    }
  }, []);

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const startOrder = () => {
    setOrderStarted(true);
    console.log("WhatsApp agent spawned to make the order");
  };

  const handleAddMenuItem = () => {
    if (newItem.name && newItem.price) {
      const updatedMenu = [...menuItems, { ...newItem, id: Date.now() }];
      setMenuItems(updatedMenu);
      localStorage.setItem('restaurantMenu', JSON.stringify(updatedMenu));
      setNewItem({ name: '', price: '', image: null });
    }
  };

  const handleRemoveMenuItem = (id) => {
    const updatedMenu = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedMenu);
    localStorage.setItem('restaurantMenu', JSON.stringify(updatedMenu));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'menu') {
          setMenuImage(reader.result);
          localStorage.setItem('menuImage', reader.result);
        } else {
          setNewItem(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Order Dashboard</h1>
      <Button onClick={() => setUserRole(userRole === 'admin' ? 'team' : 'admin')} className="mb-4 bg-purple-600 hover:bg-purple-700">
        Toggle Role (Current: {userRole})
      </Button>
      
      <Tabs defaultValue={userRole === 'admin' ? 'admin' : 'menu'} className="mb-6">
        <TabsList className="w-full">
          {userRole === 'admin' && <TabsTrigger value="admin" className="w-1/2">Admin Controls</TabsTrigger>}
          <TabsTrigger value="menu" className={userRole === 'admin' ? 'w-1/2' : 'w-full'}>Menu</TabsTrigger>
        </TabsList>

        {userRole === 'admin' && (
          <TabsContent value="admin">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-700">Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-4">
                  <Button onClick={() => alert("Request for order sent to team members")} className="flex-1 bg-green-500 hover:bg-green-600">
                    Send Request for Order
                  </Button>
                  <Button onClick={startOrder} disabled={orderStarted} className="flex-1 bg-blue-500 hover:bg-blue-600">
                    {orderStarted ? "Order Started" : "Start Order"}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="menuImage" className="block text-sm font-medium text-gray-700 mb-1">Upload Menu Image</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="menuImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'menu')}
                        className="flex-1"
                      />
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Item Name</Label>
                      <Input
                        id="itemName"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter item name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700 mb-1">Item Price</Label>
                      <Input
                        id="itemPrice"
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Enter item price"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="itemImage" className="block text-sm font-medium text-gray-700 mb-1">Item Image</Label>
                    <Input
                      id="itemImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'item')}
                      className="w-full"
                    />
                  </div>
                  <Button onClick={handleAddMenuItem} className="w-full bg-indigo-500 hover:bg-indigo-600">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="menu">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-700">Restaurant Menu</CardTitle>
            </CardHeader>
            <CardContent>
              {menuImage && (
                <div className="mb-6">
                  <img src={menuImage} alt="Full Menu" className="w-full h-auto object-cover rounded-lg shadow-md" />
                </div>
              )}
              <div className="space-y-4">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow">
                    <div className="flex items-center space-x-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-full" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">${item.price}</p>
                      </div>
                    </div>
                    {userRole === 'admin' ? (
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveMenuItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleItemSelect(item.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
