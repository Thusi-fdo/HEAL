import React, {useRef, useState, useEffect} from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as jpeg from 'jpeg-js'

import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import {
  getModel,
  convertBase64ToTensor,
  startPrediction,
} from '../assets/helpers/tensor-helper';
import {cropPicture} from '../assets/helpers/image-helper';
import * as tf from '@tensorflow/tfjs'
import {Camera} from 'expo-camera';
import * as FileSystem from 'expo-file-system';

const RESULT_MAPPING = ['Pneumonia', 'No Pneumonia'];

const Xray = () => {
  const cameraRef = useRef();
  const [isProcessing, setIsProcessing] = useState(false);
  const [presentedShape, setPresentedShape] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [image, setImage] = useState("");

  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleImageCapture = async () => {    //capturing image
    setIsProcessing(true);
    // const imageData = await cameraRef.current.takePictureAsync({
    //   base64: true,
    // });

    // const imageData = image.readFile("base64");
    const imgB64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    processImagePrediction(imgB64);
  };

  const imageToTensor = async(rawImageData) =>{
    const TO_UINT8ARRAY = true
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0 // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]

      offset += 4
    }

    return tf.tensor3d(buffer, [height, width, 3])
  }
  const processImagePrediction = async (base64Image) => {   //calling tensorflow 
    //const croppedData = await cropPicture(base64Image, 300);
    const model = await getModel();
    //const tensor = await convertBase64ToTensor(croppedData.base64);

    const imgBuffer = tf.util.encodeString(base64Image, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer)
    const tensor = imageToTensor(raw);

    const prediction = await startPrediction(model, tensor);
    console.log(prediction)
    const highestPrediction = prediction.indexOf(
      Math.max.apply(null, prediction),
    );
    //const highestPrediction=prediction.as1D().argMax().dataSync()[0];
    setPresentedShape(RESULT_MAPPING[highestPrediction]);
    console.log(presentedShape);
 
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result);
      }
  };
  return (
    <View style={styles.container}>
       <Modal visible={isProcessing} transparent={true} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text>Your current shape is {presentedShape}</Text>
            {presentedShape === '' && <ActivityIndicator size="large" />}
            <Pressable
              style={styles.dismissButton}
              onPress={() => {
                setPresentedShape('');
                setIsProcessing(false);
              }}>
              <Text>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal> 
      
      {/*

      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        autoFocus={true}
            whiteBalance={Camera.Constants.WhiteBalance.auto}></Camera>*/}
        

     
       
       
         {/* <Camera style={styles.camera} type={type}  ref={cameraRef} width="100%" height="100%">
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
        </View>
      </Camera> */}

      <TouchableOpacity
          style={styles.imageWrapper}
          onPress={pickImage}>
        

       
            <Text style={styles.transparentText}>Tap to choose image</Text>
       
        </TouchableOpacity>

      

       
        

      <Pressable
       onPress={() => handleImageCapture()}

      // onPress={pickImage}
        style={styles.captureButton}></Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  captureButton: {
    position: 'absolute',
    left: Dimensions.get('screen').width / 2 - 50,
    bottom: 40,
    width: 100,
    zIndex: 100,
    height: 100,
    backgroundColor: 'grey',
    borderRadius: 50,
  },
  modal: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
    borderRadius: 24,
    backgroundColor: 'gray',
  },
  dismissButton: {
    width: 150,
    height: 50,
    marginTop: 60,
    borderRadius: 24,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
  },

  imageWrapper: {
    width: 280,
    height: 280,
    padding: 10,
    borderColor: '#cf667f',
    borderWidth: 5,
    borderStyle: 'dashed',
    marginTop: 40,
    marginBottom: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  transparentText: {
    color: '#ffffff',
    opacity: 0.7
  },

});

export default Xray;