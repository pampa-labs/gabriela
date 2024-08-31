import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Upload, Check, Send, Mail } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Dashboard = () => {
  const [userRole, setUserRole] = useState('admin');
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderRequested, setOrderRequested] = useState(false);
  const [orderStarted, setOrderStarted] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', image: null });
  const [menuImage, setMenuImage] = useState(null);
  const [emailList, setEmailList] = useState('');

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
    setSelectedItem(itemId);
  };

  const requestOrder = () => {
    setOrderRequested(true);
    toast({
      title: "Order Requested",
      description: "Team members can now select their orders.",
    });
  };

  const startOrder = () => {
    setOrderStarted(true);
    toast({
      title: "Order Started",
      description: "WhatsApp agent spawned to make the order.",
    });
  };

  const confirmOrder = () => {
    if (selectedItem) {
      toast({
        title: "Order Confirmed",
        description: `Your order for ${menuItems.find(item => item.id === selectedItem).name} has been confirmed.`,
      });
    } else {
      toast({
        title: "Order Error",
        description: "Please select an item before confirming your order.",
        variant: "destructive",
      });
    }
  };

  const handleAddMenuItem = () => {
    if (newItem.name && newItem.price) {
      const updatedMenu = [...menuItems, { ...newItem, id: Date.now() }];
      setMenuItems(updatedMenu);
      localStorage.setItem('restaurantMenu', JSON.stringify(updatedMenu));
      setNewItem({ name: '', price: '', image: null });
      toast({
        title: "Menu Item Added",
        description: `${newItem.name} has been added to the menu.`,
      });
    }
  };

  const handleRemoveMenuItem = (id) => {
    const updatedMenu = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedMenu);
    localStorage.setItem('restaurantMenu', JSON.stringify(updatedMenu));
    toast({
      title: "Menu Item Removed",
      description: "The selected item has been removed from the menu.",
    });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'menu') {
          setMenuImage(reader.result);
          localStorage.setItem('menuImage', reader.result);
          toast({
            title: "Menu Image Uploaded",
            description: "The full menu image has been updated.",
          });
        } else {
          setNewItem(prev => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMenu = () => {
    // Implement the logic to send the menu (e.g., via API)
    toast({
      title: "Menu Sent",
      description: "The menu has been sent to the team.",
    });
  };

  const sendEmails = () => {
    // Implement the logic to send emails (e.g., via API)
    toast({
      title: "Emails Sent",
      description: "Invitations have been sent to the team members.",
    });
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Order Dashboard</h1>
      <Button 
        onClick={() => setUserRole(userRole === 'admin' ? 'team' : 'admin')} 
        className="mb-4 bg-gray-600 hover:bg-gray-700 text-white"
      >
        Toggle Role (Current: {userRole})
      </Button>
      
      <Tabs defaultValue={userRole === 'admin' ? 'admin' : 'menu'} className="mb-6">
        <TabsList className="w-full bg-white shadow-md">
          {userRole === 'admin' && <TabsTrigger value="admin" className="w-1/2">Admin Controls</TabsTrigger>}
          <TabsTrigger value="menu" className={userRole === 'admin' ? 'w-1/2' : 'w-full'}>Menu</TabsTrigger>
        </TabsList>

        {userRole === 'admin' && (
          <TabsContent value="admin">
            <Card className="bg-white shadow-lg border-t-4 border-gray-500">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800">Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-4">
                  <Button 
                    onClick={requestOrder} 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={orderRequested}
                  >
                    {orderRequested ? "Order Requested" : "Request Order"}
                  </Button>
                  <Button 
                    onClick={startOrder} 
                    disabled={!orderRequested || orderStarted} 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
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
                  <Button onClick={handleAddMenuItem} className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm py-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
                  </Button>
                  <Button onClick={sendMenu} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2">
                    <Send className="mr-2 h-4 w-4" /> Send Menu
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2">
                        <Mail className="mr-2 h-4 w-4" /> Send Invitations
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Send Invitations</DialogTitle>
                        <DialogDescription>
                          Enter email addresses separated by commas.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Textarea
                          placeholder="email1@example.com, email2@example.com"
                          value={emailList}
                          onChange={(e) => setEmailList(e.target.value)}
                        />
                      </div>
                      <Button onClick={sendEmails}>Send Invitations</Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="menu">
          <Card className="bg-white shadow-lg border-t-4 border-gray-500">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Restaurant Menu</CardTitle>
            </CardHeader>
            <CardContent>
              {menuImage && (
                <div className="mb-6">
                  <img src={menuImage} alt="Full Menu" className="w-full h-auto object-cover rounded-lg shadow-md" />
                </div>
              )}
              <RadioGroup value={selectedItem} onValueChange={handleItemSelect} className="space-y-4">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition-colors">
                    <div className="flex items-center space-x-4 flex-1">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-full" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">${item.price}</p>
                      </div>
                    </div>
                    {userRole === 'admin' ? (
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveMenuItem(item.id)} className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <RadioGroupItem value={item.id} id={`item-${item.id}`} className="ml-2" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              {userRole !== 'admin' && orderRequested && !orderStarted && (
                <Button 
                  onClick={confirmOrder} 
                  className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white"
                  disabled={!selectedItem}
                >
                  <Check className="mr-2 h-4 w-4" /> Confirm Order
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
