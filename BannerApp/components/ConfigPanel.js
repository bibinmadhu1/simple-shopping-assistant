import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title, Slider } from 'react-native-paper';

const ConfigPanel = ({ config, onConfigChange, selectedImage, onImageSelect }) => {
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFFFFF', '#000000', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ];

  const backgroundColors = [
    '#00000080', '#FF000080', '#00FF0080', '#0000FF80', '#FFFF0080',
    '#FFFFFF80', '#00000040', '#FFFFFF40', '#FF000040', '#00FF0040'
  ];

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Banner Configuration</Title>
        
        <TextInput
          label="Banner Text"
          value={config.text}
          onChangeText={(text) => onConfigChange('text', text)}
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.sliderContainer}>
          <Title style={styles.sliderLabel}>Text Size: {config.textSize}</Title>
          <Slider
            value={config.textSize}
            onValueChange={(value) => onConfigChange('textSize', value)}
            minimumValue={12}
            maximumValue={72}
            step={2}
            style={styles.slider}
          />
        </View>

        <View style={styles.colorSection}>
          <Title style={styles.sectionTitle}>Text Color</Title>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorGrid}>
              {colors.map((color, index) => (
                <View key={index} style={styles.colorButtonContainer}>
                  <Button
                    mode={config.textColor === color ? "contained" : "outlined"}
                    style={[styles.colorButton, { backgroundColor: color }]}
                    onPress={() => onConfigChange('textColor', color)}
                    contentStyle={styles.colorButtonContent}
                  >
                    {' '}
                  </Button>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.colorSection}>
          <Title style={styles.sectionTitle}>Background Color</Title>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorGrid}>
              {backgroundColors.map((color, index) => (
                <View key={index} style={styles.colorButtonContainer}>
                  <Button
                    mode={config.backgroundColor === color ? "contained" : "outlined"}
                    style={[styles.colorButton, { backgroundColor: color }]}
                    onPress={() => onConfigChange('backgroundColor', color)}
                    contentStyle={styles.colorButtonContent}
                  >
                    {' '}
                  </Button>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {selectedImage && (
          <Button
            mode="outlined"
            onPress={() => onImageSelect(null)}
            style={styles.removeButton}
            icon="delete"
          >
            Remove Image
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  colorSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  colorButtonContainer: {
    marginRight: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: '#ddd',
  },
  colorButtonContent: {
    width: 40,
    height: 40,
  },
  removeButton: {
    marginTop: 16,
    borderColor: '#ff4444',
  },
});

export default ConfigPanel;