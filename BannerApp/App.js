import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import ImageBanner from './components/ImageBanner';
import ConfigPanel from './components/ConfigPanel';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

export default function App() {
  const [bannerConfig, setBannerConfig] = useState({
    text: 'Your Banner Text',
    textSize: 24,
    textColor: '#ffffff',
    backgroundColor: '#00000080',
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate loading fonts or other assets
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const updateConfig = (key, value) => {
    setBannerConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ImageBanner
            config={bannerConfig}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
          />
          <ConfigPanel
            config={bannerConfig}
            onConfigChange={updateConfig}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
          />
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});