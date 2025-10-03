Banner App
A React Native application that allows users to add customizable text banners behind images. Users can configure the text content, size, color, and background transparency.

Features
📝 Customizable banner text

🎨 Adjustable text size and color

🖼️ Image selection from device gallery

🎭 Transparent background options for text banner

📱 Responsive design for both iOS and Android

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14 or newer)

npm or yarn

Expo CLI (npm install -g expo-cli)

iOS Simulator (for Mac users) or Android Studio (for Android emulation)

Installation
Create a new directory and navigate to it

bash
mkdir banner-app
cd banner-app
Initialize a new Expo project

bash
expo init . -t blank
Install the required dependencies

bash
npm install react-native-paper expo-image-picker expo-permissions
Replace the contents of App.js with the provided code

npm install 

Start the development server

bash
npm start
# or
yarn start
Running the App
On iOS Simulator
Make sure you have Xcode installed

Press i in the terminal after running npm start

Or click "Run on iOS simulator" in the Expo DevTools

On Android Emulator
Make sure you have Android Studio installed and an emulator set up

Press a in the terminal after running npm start

Or click "Run on Android device/emulator" in the Expo DevTools

On Physical Device
Install the Expo Go app on your iOS or Android device

Scan the QR code shown in the terminal or Expo DevTools

The app will load on your device

Usage
Select an Image: Tap the "Select Image" button or the placeholder area to choose an image from your gallery

Customize Text: Enter your desired banner text in the input field

Adjust Text Size: Use the slider to change the text size (12-72px)

Choose Text Color: Select from predefined colors or use the default

Set Background: Choose a background color for your text banner

Remove Image: Use the "Remove Image" button to clear the current image

Building for Production
Android APK
bash
expo build:android
iOS IPA
bash
expo build:ios
Creating Standalone Apps
bash
# For Android
expo build:android -t apk

# For iOS
expo build:ios
Deployment
Expo Publishing
bash
expo publish
App Stores
Build the app using expo build:android or expo build:ios

Follow the instructions to submit to Google Play Store or Apple App Store

File Structure
text
banner-app/
├── App.js                 # Main application component
├── app.json              # Expo configuration
├── components/
│   ├── ImageBanner.js    # Component for displaying image with banner
│   └── ConfigPanel.js    # Configuration controls component
├── assets/               # Static assets (images, fonts)
├── package.json          # Dependencies and scripts
└── README.md            # This file
Troubleshooting
Common Issues
Permission Errors: Ensure you grant camera roll permissions when prompted

Build Failures: Make sure all dependencies are properly installed

Image Loading Issues: Check internet connection for remote images

Font Loading Issues: The app includes code to load required fonts

If you encounter the QR code issue:
Make sure your phone and computer are on the same Wi-Fi network

Try using the tunnel connection option in Expo DevTools

Alternatively, use the expo login command to authenticate:

bash
expo login
License
This project is open source and available under the MIT License.

Support
For support and questions, please contact the development team or create an issue in the project repository.

Note: This app requires camera roll permissions to select images from your device. No images are uploaded to external servers - all processing happens locally on your device.

This updated implementation should resolve the issues you were experiencing with the QR code not loading the app properly. The key changes include:

Added proper font loading for React Native Paper

Updated the permissions handling for image picking

Added the required app.json configuration file

Fixed styling issues in the ConfigPanel component

Added proper dependency management