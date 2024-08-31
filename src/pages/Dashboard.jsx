import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [userRole, setUserRole] = useState('admin');
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderStarted, setOrderStarted] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', image: null });

  useEffect(() => {
    const savedMenu = localStorage.getItem('restaurantMenu');
    if (savedMenu) {
      setMenuItems(JSON.parse(savedMenu));
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Order Dashboard</h1>
      <Button onClick={() => setUserRole(userRole === 'admin' ? 'team' : 'admin')} className="mb-4">
        Toggle Role (Current: {userRole})
      </Button>
      
      <Tabs defaultValue={userRole === 'admin' ? 'admin' : 'menu'} className="mb-6">
        <TabsList>
          {userRole === 'admin' && <TabsTrigger value="admin">Admin Controls</TabsTrigger>}
          <TabsTrigger value="menu">Menu</TabsTrigger>
        </TabsList>

        {userRole === 'admin' && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => alert("Request for order sent to team members")}>
                  Send Request for Order
                </Button>
                <Button onClick={startOrder} disabled={orderStarted}>
                  {orderStarted ? "Order Started" : "Start Order"}
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemPrice">Item Price</Label>
                  <Input
                    id="itemPrice"
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Enter item price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemImage">Item Image</Label>
                  <Input
                    id="itemImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <Button onClick={handleAddMenuItem}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Menu</CardTitle>
            </CardHeader>
            <CardContent>
              {menuItems.map(item => (
                <div key={item.id} className="flex items-center justify-between mb-4 p-2 border rounded">
                  <div className="flex items-center">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                    )}
                    <span className="text-lg">{item.name} - ${item.price}</span>
                  </div>
                  {userRole === 'admin' ? (
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveMenuItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Select onValueChange={(value) => handleItemSelect(item.id)} value={selectedItems.includes(item.id) ? 'selected' : ''}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Not selected</SelectItem>
                        <SelectItem value="selected">Selected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
