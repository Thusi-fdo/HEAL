import React,{useState,useEffect} from 'react';
import { Button, View, Text,Image, TouchableOpacity, RefreshControl } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {db} from '../Configdb';
import * as firebase from 'firebase';

  
  export default function HomeScreen(props) {
    const [isLoading, setLoading] = useState(false)
    const [listData, setListData] = useState([]);

    useEffect(() => {
        fetchFeed();
    }, [])

    const fetchFeed = async () => {
        const res = await firebase.database().ref("/doctors/").once("value")
        // {key:[], key:[], key:[]}
        var tempData = []
        Object.keys(res.val()).sort((a, b) => { return (b - a) }).forEach(keys => {
            tempData = [
                ...tempData,
                res.val()[keys]
            ]
        })
        setListData(tempData)
      
    }

    return (
        <View style={{flex:1, }}>
           <FlatList
              refreshControl={
               <RefreshControl refreshing={isLoading} onRefresh={async () => {
                   setLoading(true)
                   //console.log("loading")
                   await fetchFeed()
                   setLoading(false)
               }} />
               
           }
           
             data={listData}
             renderItem={({item}) =>
               <TouchableOpacity style={{margin:10,borderRadius:7,elevation:5,backgroundColor:"white",shadowColor: '#333',
               shadowOffset: { width: 0, height: 1 },
               shadowOpacity: 0.5,
               shadowRadius: 2}}
               onPress={() => {
                 props.navigation.navigate('RecipeScreen')}} 
               >
 
                 <View style={{flexDirection:"row", alignItems:"center", padding:10}} >
                   <Image 
                   source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM1q99ZLLIiDZYf8MAogmyxW8q_Y4wXC127w&usqp=CAU"}} 
                   style={{height:50,borderRadius:50,width:50}}/>
                   <View style={{ marginLeft: 10 }}>
                       <Text style={{ fontSize: 20 }}>{item.name}</Text>
                       <View style={{ flexDirection: "row" }}>
                           <Text style={{ fontSize: 12 }}> {item.Specialist} </Text>{/*{new Date(item.createdOn).toString().substring(0, 16)}*/}
                           <Text style={{ fontSize: 12, marginLeft: 5 }}>{new Date(item.createdOn).getHours() + " : " + new Date(item.createdOn).getMinutes()}</Text>
                       </View>
                    </View>             
                 </View>
                     {/* {
                         item.isImage ? <Image source={{ uri: "https://firebasestorage.googleapis.com/v0/b/youcook-5eb7e.appspot.com/o/feed%2F" + item.createdOn + "?alt=media&token=5239e414-4df6-4cc8-ae7a-b66105a68a1d" }} style={{ height: 200 }} />
                             : null
                     } */}
 
                     <Text style={{ margin: 10, color: "#333", fontSize: 12, marginTop: 5 }}>{item.text}</Text>
               
                 <View style={{ height: 1, width: "100%", backgroundColor: "#3333" }} />
 
                 <View style={{ flexDirection: "row", }}>
                     <TouchableOpacity style={{ flex: 1, margin: 10 }}>
                         <Text style={{ textAlign: "center", fontWeight: "bold" }}>Contact</Text>
                     </TouchableOpacity>
 
                     <View style={{ backgroundColor: "#3333", height: "100%", width: 1 }} />
 
                     <TouchableOpacity style={{ flex: 1, margin: 10 }}>
                         <Text style={{ textAlign: "center", fontWeight: "bold" }}>Make an Appointment</Text>
                     </TouchableOpacity>
                 </View>
               
               </TouchableOpacity>}   
             keyExtractor={(item)=>(item)}        
           />
         
           
        </View>
       
     )
   }
   
 