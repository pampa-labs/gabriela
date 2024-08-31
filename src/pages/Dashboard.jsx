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
import axios from 'axios';

const Dashboard = () => {
  const [userRole, setUserRole] = useState('admin'); // Changed to 'admin' for testing
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });
  const [invitationLink, setInvitationLink] = useState('');

  // New state variables for MenuInference
  const [menuInferenceMode, setMenuInferenceMode] = useState('select');
  const [menuImage, setMenuImage] = useState(null);
  const [manualItems, setManualItems] = useState([{ name: '', price: '' }]);
  const [inferredMenuItems, setInferredMenuItems] = useState([]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'menu') {
        setMenuImage(file);
        setMenuInferenceMode('image');
      } else {
        // Handle item image upload
        setNewItem(prev => ({ ...prev, image: file }));
      }
    }
  };

  const inferMenu = async () => {
    setLoading(true);
    try {
      let payload;
      if (menuInferenceMode === 'image') {
        const formData = new FormData();
        formData.append('image', menuImage);
        payload = formData;
      } else {
        payload = { manual_items: manualItems.filter(item => item.name && item.price) };
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/infer-menu`, payload, {
        headers: menuInferenceMode === 'image' ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      setInferredMenuItems(response.data.menu_items);
      toast({
        title: "Menu Inferred",
        description: "The menu has been successfully inferred.",
      });
    } catch (error) {
      console.error('Failed to infer menu:', error);
      toast({
        title: "Error",
        description: "Failed to infer menu. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addManualItem = () => {
    setManualItems([...manualItems, { name: '', price: '' }]);
  };

  const updateManualItem = (index, field, value) => {
    const updatedItems = [...manualItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setManualItems(updatedItems);
  };

  const generateInvitationLink = () => {
    // Implement invitation link generation logic
    setInvitationLink('https://example.com/invite/abc123');
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast({
      title: "Copied",
      description: "Invitation link copied to clipboard",
    });
  };

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
                {menuInferenceMode === 'select' ? (
                  <div className="space-y-4">
                    <Button onClick={() => setMenuInferenceMode('image')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out">
                      <Upload className="mr-2 h-5 w-5" /> Upload Menu Image
                    </Button>
                    <Button onClick={() => setMenuInferenceMode('manual')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out">
                      <PlusCircle className="mr-2 h-5 w-5" /> Manual Item Entry
                    </Button>
                  </div>
                ) : menuInferenceMode === 'image' ? (
                  <div className="space-y-4">
                    <Label htmlFor="menuImage" className="block text-lg font-medium text-gray-700 mb-2">Upload Menu Image</Label>
                    <Input
                      id="menuImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'menu')}
                      className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {menuImage && (
                      <div className="mt-4">
                        <img src={URL.createObjectURL(menuImage)} alt="Full Menu" className="w-full h-auto object-cover rounded-xl shadow-lg" />
                      </div>
                    )}
                    <Button onClick={inferMenu} disabled={!menuImage || loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out">
                      {loading ? 'Processing...' : 'Infer Menu'}
                    </Button>
                    <Button onClick={() => setMenuInferenceMode('select')} className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out">
                      Back
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Manual Item Entry</h3>
                    {manualItems.map((item, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={item.name}
                          onChange={(e) => updateManualItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                          className="flex-1"
                        />
                        <Input
                          value={item.price}
                          onChange={(e) => updateManualItem(index, 'price', e.target.value)}
                          placeholder="Price"
                          className="w-1/3"
                        />
                      </div>
                    ))}
                    <Button onClick={addManualItem} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
                      <PlusCircle className="mr-2 h-5 w-5" /> Add Item
                    </Button>
                    <Button onClick={inferMenu} disabled={manualItems.every(item => !item.name && !item.price) || loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out">
                      {loading ? 'Processing...' : 'Process Items'}
                    </Button>
                    <Button onClick={() => setMenuInferenceMode('select')} className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-md shadow-lg transition duration-300 ease-in-out">
                      Back
                    </Button>
                  </div>
                )}

                {inferredMenuItems.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Inferred Menu Items:</h3>
                    <ul className="space-y-2">
                      {inferredMenuItems.map((item, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                          <span>{item.name}</span>
                          <span className="font-semibold">{item.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="menu">
          <Card className="bg-white shadow-2xl rounded-xl border-t-4 border-green-500">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800">Menu</CardTitle>
            </CardHeader>
            <CardContent>
              {inferredMenuItems.length > 0 ? (
                <ul className="space-y-2">
                  {inferredMenuItems.map((item, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                      <span>{item.name}</span>
                      <span className="font-semibold">{item.price}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-600">No menu items available. Use the Admin Controls to add items.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="orders">
            <Card className="bg-white shadow-2xl rounded-xl border-t-4 border-yellow-500">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-800">View Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">Order viewing functionality to be implemented.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>
      {loading && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-5 rounded-lg">Loading...</div>
      </div>}

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