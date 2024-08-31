import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Upload, Check, Send, Mail, Clipboard, Eye } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('admin');
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderStarted, setOrderStarted] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', image: null, description: '' });
  const [menuImage, setMenuImage] = useState(null);
  const [invitationLink, setInvitationLink] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setMenuItems(data);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: `Failed to fetch menu items: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItem(itemId);
  };

  const startOrder = () => {
    setOrderStarted(true);
    // Mock WhatsApp integration
    toast({
      title: "Order Started",
      description: "WhatsApp message sent to the restaurant.",
    });
  };

  const confirmOrder = () => {
    if (selectedItem) {
      const selectedItemDetails = menuItems.find(item => item.id === selectedItem);
      // Mock backend call to save order
      console.log('Saving order:', { item: selectedItemDetails, user: 'Current User' });
      toast({
        title: "Order Confirmed",
        description: `Your order for ${selectedItemDetails.name} has been confirmed.`,
      });
    } else {
      toast({
        title: "Order Error",
        description: "Please select an item before confirming your order.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    if (username === 'test' && password === 'test') {
      setIsLoggedIn(true);
      toast({
        title: "Logged In",
        description: "Welcome to the dashboard.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials.",
        variant: "destructive",
      });
    }
  };

  const handleAddMenuItem = async () => {
    if (newItem.name && newItem.price) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('menu_items')
          .insert([
            { 
              name: newItem.name, 
              price: parseFloat(newItem.price),
              description: newItem.description || null,
              image: newItem.image || null
            }
          ])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setMenuItems(prevItems => [...prevItems, data[0]]);
          setNewItem({ name: '', price: '', image: null, description: '' });
          setDialogContent({
            title: "Success",
            description: `${data[0].name} has been added to the menu.`
          });
        } else {
          throw new Error('No data returned from insert operation');
        }
      } catch (error) {
        console.error('Error adding menu item:', error);
        setDialogContent({
          title: "Error",
          description: `Failed to add menu item: ${error.message}`
        });
      } finally {
        setLoading(false);
        setShowDialog(true);
      }
    } else {
      setDialogContent({
        title: "Invalid Input",
        description: "Name and price are required."
      });
      setShowDialog(true);
    }
  };

  const handleRemoveMenuItem = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
      toast({
        title: "Menu Item Removed",
        description: "The selected item has been removed from the menu.",
      });
    } catch (error) {
      console.error('Error removing menu item:', error);
      toast({
        title: "Error",
        description: "Failed to remove menu item.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl }, error: urlError } = supabase.storage
          .from('menu-images')
          .getPublicUrl(data.path);

        if (urlError) throw urlError;

        if (type === 'menu') {
          setMenuImage(publicUrl);
          // You might want to store this URL in Supabase as well if needed
        } else {
          setNewItem(prev => ({ ...prev, image: publicUrl }));
        }

        toast({
          title: "Image Uploaded",
          description: type === 'menu' ? "The full menu image has been updated." : "Item image has been uploaded.",
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const generateInvitationLink = () => {
    const link = `${window.location.origin}/order/${Date.now()}`;
    setInvitationLink(link);
    toast({
      title: "Invitation Link Generated",
      description: "Share this link with your team members.",
    });
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast({
      title: "Link Copied",
      description: "The invitation link has been copied to your clipboard.",
    });
  };

  const sendOrderToRestaurant = () => {
    // Mock sending order to restaurant
    toast({
      title: "Order Sent",
      description: "The order has been sent to the restaurant.",
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-5xl font-bold mb-8 text-center text-gray-800 tracking-tight">Order Dashboard</h1>
      
      <Tabs defaultValue={userRole === 'admin' ? 'admin' : 'menu'} className="mb-8">
        <TabsList className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          {userRole === 'admin' && <TabsTrigger value="admin" className="w-1/3 py-3 text-lg font-semibold">Admin Controls</TabsTrigger>}
          <TabsTrigger value="menu" className={userRole === 'admin' ? 'w-1/3 py-3 text-lg font-semibold' : 'w-full py-3 text-lg font-semibold'}>Menu</TabsTrigger>
          {userRole === 'admin' && <TabsTrigger value="orders" className="w-1/3 py-3 text-lg font-semibold">View Orders</TabsTrigger>}
        </TabsList>

        {userRole === 'admin' && (
          <TabsContent value="admin">
            <Card className="bg-white shadow-2xl rounded-xl border-t-4 border-indigo-500">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-800">Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="menuImage" className="block text-lg font-medium text-gray-700 mb-2">Upload Menu Image</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="menuImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'menu')}
                        className="flex-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <Button onClick={() => document.getElementById('menuImage').click()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
                        <Upload className="h-5 w-5 mr-2" /> Upload
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="itemName" className="block text-lg font-medium text-gray-700 mb-2">Item Name *</Label>
                      <Input
                        id="itemName"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter item name"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemPrice" className="block text-lg font-medium text-gray-700 mb-2">Item Price *</Label>
                      <Input
                        id="itemPrice"
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Enter item price"
                        className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="itemDescription" className="block text-lg font-medium text-gray-700 mb-2">Item Description (Optional)</Label>
                    <Textarea
                      id="itemDescription"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter item description"
                      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemImage" className="block text-lg font-medium text-gray-700 mb-2">Item Image (Optional)</Label>
                    <Input
                      id="itemImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'item')}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <Button onClick={handleAddMenuItem} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Menu Item
                  </Button>
                  <div className="space-y-4">
                    <Button onClick={generateInvitationLink} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                      <Mail className="mr-2 h-5 w-5" /> Generate Invitation Link
                    </Button>
                    {invitationLink && (
                      <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-md">
                        <Input value={invitationLink} readOnly className="flex-1 bg-transparent border-none" />
                        <Button onClick={copyInvitationLink} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
                          <Clipboard className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="menu">
          <Card className="bg-white shadow-2xl rounded-xl border-t-4 border-indigo-500">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800">Restaurant Menu</CardTitle>
            </CardHeader>
            <CardContent>
              {menuImage && (
                <div className="mb-8">
                  <img src={menuImage} alt="Full Menu" className="w-full h-auto object-cover rounded-xl shadow-lg" />
                </div>
              )}
              <RadioGroup value={selectedItem} onValueChange={handleItemSelect} className="space-y-6">
                {menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                    <div className="flex items-center space-x-6 flex-1">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-full shadow-md" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-xl text-indigo-600 font-bold">${item.price}</p>
                        {item.description && <p className="text-gray-600">{item.description}</p>}
                      </div>
                    </div>
                    {userRole === 'admin' ? (
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveMenuItem(item.id)} className="ml-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition duration-300 ease-in-out">
                        <Trash2 className="h-6 w-6" />
                      </Button>
                    ) : (
                      <RadioGroupItem value={item.id} id={`item-${item.id}`} className="ml-4 w-6 h-6" />
                    )}
                  </div>
                ))}
              </RadioGroup>
              {userRole !== 'admin' && !orderStarted && (
                <Button 
                  onClick={confirmOrder} 
                  className="mt-8 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                  disabled={!selectedItem}
                >
                  <Check className="mr-2 h-6 w-6" /> Confirm Order
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="orders">
            <Card className="bg-white shadow-2xl rounded-xl border-t-4 border-indigo-500">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-800">Confirmed Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg shadow">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p>Item: {order.item.name}</p>
                        <p>Price: ${order.item.price}</p>
                        <p>User: {order.user}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No orders to display.</p>
                )}
                <Button 
                  onClick={sendOrderToRestaurant} 
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                >
                  <Send className="mr-2 h-6 w-6" /> Send Order to Restaurant
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      {loading && <div>Loading...</div>}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
