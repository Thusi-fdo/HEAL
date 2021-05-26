import React from 'react'
import { Text, View, StyleSheet,StatusBar, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native'
import * as tf from '@tensorflow/tfjs'
import { fetch } from '@tensorflow/tfjs-react-native'
import * as tf_rn from "@tensorflow/tfjs-react-native";
import Constants from 'expo-constants'
import * as jpeg from 'jpeg-js'
import * as Permissions from 'expo-permissions'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decodeJpeg, bundleResourceIO } from '@tensorflow/tfjs-react-native';


const labels = ['Pneumonia', 'Normal'];
class XrayScreen extends React.Component {
   state = {
     isTfReady: false,
     isModelReady:false,
     //model: false,
     predictions: null,
     image: null,
     modelJson : require('../assets/Model/model.json'),
     modelWeights : require('../assets/Model/weights.bin'),
     mostConfidentLabel: null,
   }

  

   getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
      }
    }
  }

    async componentDidMount() {
        await tf.ready()
        this.setState({
        isTfReady: true
        })
       // this.model = await mobilenet.load()
       
      // Use the bundleResorceIO IOHandler to load the model

       
        this.model = await tf.loadLayersModel(   // tf.loadGraphModel
          bundleResourceIO(this.state.modelJson, this.state.modelWeights)); 
        
        this.setState({ isModelReady: true })


        // add this
        this.getPermissionAsync()
    }



   imageToTensor(rawImageData) {
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

    return tf.tensor3d(buffer, [height, width, 3]).expandDims();
  }

  classifyImage = async () => {
    try {
      /*const imageAssetPath = Image.resolveAssetSource(this.state.image) 
      const response = await fetch(imageAssetPath.uri, {}, { isBinary: true }) //imageAssetPath.uri
      const rawImageData = await response.arrayBuffer()
      const imageTensor = this.imageToTensor(rawImageData)
      const predictions = await this.model.classify(imageTensor)
      this.setState({ predictions })*/
      //console.log(predictions)

      /*const fileUri = this.state.image.uri;      
      const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
	        encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)  
      const imageTensor = jpeg.decode(raw,true);
      //const predictions = await this.model.classify(imageTensor)
      */
     

        /*const fileUri = this.state.image.uri;      
        const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer) 
        const imageTensor = jpeg.decode(raw,true); 
        // Init input with correct shape
        let input = tf.zeros([1, 224, 224, 3]);
        // Add img to input
        input[0] = imageTensor;
 

      const predictions = await this.model.predict(input);
      
      this.setState({ predictions })*/


      const imageAssetPath = Image.resolveAssetSource(this.state.image)
      

      console.log(imageAssetPath.uri);
      const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)   

      const tfImg = tf.browser.fromPixels(jpeg.decode(raw, true)).expandDims(0);
      const smallImg = await tf.image.resizeBilinear(tfImg, [224, 224]);
      const resized = tf.cast(smallImg, 'float32');
      const t4d = tf.tensor4d(Array.from(resized.dataSync()), [1, 224, 224, 3]);


      //const imageTensor = this.imageToTensor(raw);
      //console.log('imageTensor: ', imageTensor);


      

      //let input = tf.zeros([1,224,224,3])
      //input[0] = imageTensor
      const predictions = await this.model.predict(t4d)

      const data = predictions.dataSync() //arraySync()

      console.log(data)
      console.log(predictions.as1D().argMax().print()) //most confident prediction
      const labelPrediction = predictions.as1D().argMax().dataSync()[0];
      this.state.mostConfidentLabel = (labels[labelPrediction]);
      this.setState({ predictions: data})

    } catch (error) {
      console.log(error)
    }
  }

  selectImage = async () => {
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [3, 3]
      })
  
      if (!response.cancelled) {
        const source = { uri: response.uri }
        this.setState({ image: source })
        this.classifyImage()
      }
    } catch (error) {
      console.log(error)
    }
  }
  renderPrediction = prediction => {
    return (
      <Text key={prediction.className} style={styles.text}>
        {prediction.className}
      </Text>
    )
  }




  render() {
    const { isTfReady, isModelReady, predictions, image, mostConfidentLabel } = this.state

    return (
      <View style={styles.container}>
        <StatusBar barStyle='light-content' />
        <View style={styles.loadingContainer}>
          <Text style={styles.text}>
            TFJS ready? {isTfReady ? <Text>✅</Text> : ''}
          </Text>

          <View style={styles.loadingModelContainer}>
            <Text style={styles.text}>Model ready? </Text>
            {isModelReady ? (
              <Text style={styles.text}>✅</Text>
            ) : (
              <ActivityIndicator size='small' />
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.imageWrapper}
          onPress={isModelReady ? this.selectImage : undefined}>
          {image && <Image source={image} style={styles.imageContainer} />}

          {isModelReady && !image && (
            <Text style={styles.transparentText}>Tap to choose image</Text>
          )}
        </TouchableOpacity>
        <View style={styles.predictionWrapper}>
          {isModelReady && image && (
            <Text style={styles.text}>
              Predictions: {predictions ? '' : 'Predicting...'}
            </Text>
          )}
          {isModelReady &&
            predictions &&
            <Text style={styles.text}>
              {mostConfidentLabel}
            </Text>
             
          }
        </View>
        <View style={styles.footer}>
          <Text style={styles.poweredBy}>Powered by:</Text>
          <Image source={require('../assets/Doc.png')} style={styles.tfLogo} />
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#171f24',
      alignItems: 'center'
    },
    loadingContainer: {
      marginTop: 80,
      justifyContent: 'center'
    },
    text: {
      color: '#ffffff',
      fontSize: 16
    },
    loadingModelContainer: {
      flexDirection: 'row',
      marginTop: 10
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
    imageContainer: {
      width: 250,
      height: 250,
      position: 'absolute',
      top: 10,
      left: 10,
      bottom: 10,
      right: 10
    },
    predictionWrapper: {
      height: 100,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center'
    },
    transparentText: {
      color: '#ffffff',
      opacity: 0.7
    },
    footer: {
      marginTop: 40
    },
    poweredBy: {
      fontSize: 20,
      color: '#e69e34',
      marginBottom: 6
    },
    tfLogo: {
      width: 125,
      height: 70
    }
  })

export default XrayScreen