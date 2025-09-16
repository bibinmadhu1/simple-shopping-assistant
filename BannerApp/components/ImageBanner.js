import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const ImageBanner = ({ config, selectedImage, onImageSelect }) => {
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        onImageSelect(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    onImageSelect(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        {/* Banner Text Background */}
        <View style={[styles.bannerTextContainer, { backgroundColor: config.backgroundColor }]}>
          <Text
            style={[
              styles.bannerText,
              {
                fontSize: config.textSize,
                color: config.textColor,
              }
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {config.text}
          </Text>
        </View>

        {/* Image Container */}
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.image}
              resizeMode="cover"
            />
            <IconButton
              icon="close"
              size={20}
              style={styles.removeButton}
              onPress={removeImage}
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.placeholderContainer} onPress={pickImage}>
            <IconButton
              icon="image-plus"
              size={40}
              color="#666"
            />
            <Text style={styles.placeholderText}>Tap to select an image</Text>
          </TouchableOpacity>
        )}
      </View>

      {!selectedImage && (
        <Button
          mode="contained"
          onPress={pickImage}
          style={styles.selectButton}
          icon="image"
        >
          Select Image
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    alignItems: 'center',
  },
  bannerContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  bannerTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 2,
    minHeight: 80,
    justifyContent: 'center',
  },
  bannerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  selectButton: {
    marginTop: 8,
  },
});

export default ImageBanner;