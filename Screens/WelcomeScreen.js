import React from 'react';
import { ImageBackground, StyleSheet, SafeAreaView, Text, Image, Button, StatusBar  } from 'react-native';

function WelcomeScreen(props) {
    return (
      //  <ImageBackground source={require('../assets/Doc.jpg')}></ImageBackground>
        //safeareaview for phones with camera in the screen top cut outs
    <SafeAreaView style={[styles.container, styles.Button]}>
    {/*<Text>Hello this is a test</Text>*/}
    <Image source={require('../assets/Doc.png')}/>
    <Button 
    color="#FFF"
    title ="Get Started For Free" Text color=""
    onPress={() => props.navigation.navigate('Signin')}/> 
    <StatusBar style="auto" />
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container:{
    flex: 1, //takes the entire screen to fill either vertical or horizontal
    backgroundColor: "#00BCD4",
    justifyContent: "center",
    alignItems: "center",
    }
  }
);

export default WelcomeScreen;
