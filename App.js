import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

const App = () => {
  const [photos, setPhotos] = useState([]);
  const [chatId, setChatId] = useState('');
  const [botToken, setBotToken] = useState('');
  useEffect(() => {
    async function fetchPhotos() {
      try {
        // Request permissions to access the camera roll
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
          console.error('Permission to access camera roll was denied');
          return;
        }
        const chatId = await AsyncStorage.getItem('chatId');
        const botToken = await AsyncStorage.getItem('botToken');
  
        if (chatId && botToken) {
          setChatId(chatId);
          setBotToken(botToken);
        }
        // Fetch the photos from the camera roll
        const cameraRollPhotos = await MediaLibrary.getAssetsAsync({
          first: 200,
        });
  
        setPhotos(cameraRollPhotos.assets); // update the photos state with the fetched photos
      } catch (error) {
        console.error(error);
      }
    }

    fetchPhotos();
  }, []);

  const handleUpload = async () => {
    try {
      await AsyncStorage.setItem('chatId', chatId);
      await AsyncStorage.setItem('botToken', botToken);
     
      // Iterate over all photos and call sendPhoto for each photo
      for (const photo of photos) {
        await sendPhoto(photo);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendPhoto = async (photo) => {
    try {
      // Make a POST request to the SendPhoto API
      const photoData = await MediaLibrary.getAssetInfoAsync(photo);
      const formData = new FormData();
      formData.append('photo', {
        name: 'photo.jpg',
        type: 'image/jpeg',
        uri: photoData.localUri,
      });
      // console.log(photoInfo);
      // console.log(filePath);
      console.log(chatId, botToken);
      const response = await axios.post(`https://api.telegram.org/${botToken}/sendPhoto?chat_id=${chatId}`,formData,{headers: {
        'Content-Type': 'multipart/form-data',
        'Content-Disposition': `form-data; name="photo"; filename="photo.jpg"`,
      }});

      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={{marginTop:150,  alignItems: 'center', justifyContent: 'center' }} >
      <ScrollView>
      {/* Add TextInput components for the chat ID and bot token */}
      <Text>Enter Chat ID:</Text>
      <TextInput
        value={chatId}
        onChangeText={setChatId} style={{marginBottom:20}}
        placeholder="Enter chat ID"
      />
      <Text>Enter Bot Token:</Text>
      <TextInput 
        value={botToken}
        onChangeText={setBotToken}  style={{marginBottom:40}}
        placeholder="Enter bot token"

      />
      {/* Add a Button to initiate the upload process */}
      <Button title="Upload" onPress={handleUpload} />
      </ScrollView>
    </View>
    
  );
};

export default App;
