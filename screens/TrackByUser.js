import * as React from 'react';
import {
    FlatList,TextInput,
    Text, StyleSheet, View, ScrollView, Dimensions, Platform, Image, PermissionsAndroid, Pressable
} from 'react-native';
import { getDBConnection, getTodoItems } from '../services/Db';
import MapView, { Marker, AnimatedRegion, Animated as MapViewAnimated, MarkerAnimated } from 'react-native-maps';
import Images from '../constants/Images';
import Geolocation from 'react-native-geolocation-service';

import * as DataLatLon from '../constants/latlondata.json';
import socketIOClient from 'socket.io-client';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const TrackByUser = ({ navigation }) => {
    // socket
    const socketRef = React.useRef();
    const [socketLocMessage, setsocketLocMessage] = React.useState([])
    const [socketOrderId, setsocketOrderId] = React.useState("1")
    const SOCKET_SERVER_URL = "https://map-tracker-rn.herokuapp.com" // "http://localhost:4000"
    const NEW_CHAT_MESSAGE_EVENT = "newLocationFound"; // Name of the event

    // map objects
    const mapRef = React.useRef(null);
    const markerRef = React.useRef(null);

    let latlon = {
        lat: 19.070845,
        lon: 72.997608,
        // delivery
    }
    let homelatlon = {
        lat: 19.078761,
        lon: 73.008739,
        // home user
    }
    const [state, setState] = React.useState({
        curLoc: {
            latitude: latlon.lat,
            longitude: latlon.lon,
        },
        // {
        //     latitude: latlon.lat,
        //     longitude: latlon.lon,
        // },
        destinationCords: {},
        isLoading: false,
        coordinate: new AnimatedRegion({
            latitude: latlon.lat,
            longitude: latlon.lon,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }),
        time: 0,
        distance: 0,
        heading: 0
    })
    const { curLoc, time, distance, destinationCords, isLoading, coordinate,heading } = state
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    const [getList, setGetList] = React.useState([]);
    // sql store sample
    const loadDataCallback = React.useCallback(async () => {
        // console.log('db0');
        try {
            console.log('Load Data from Db');
            // const db = await getDBConnection();

            // const storedTodoItems = await getTodoItems(db);
            // if (storedTodoItems.length > 0) {
            //     // console.log('data in if', storedTodoItems);
            //     setGetList(storedTodoItems)
            // }
        } catch (error) {
            console.log('error in dbquery', error);
        }
    }, []);

    React.useEffect(() => {
        loadDataCallback();
    }, []);
    // sql store

    // initial ref for map
    React.useEffect(()=>{ 
        // set home
        updateState({
            curLoc: {
                latitude: latlon.lat,
                longitude: latlon.lon,
            },
            destinationCords: {
                latitude: homelatlon.lat, // 19.078761, // 30.7046,
                longitude: homelatlon.lon, // 73.008739, // 77.1025,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            }
        })
    }, [])

    React.useEffect(() => {
        requestLocationPermission(true)
        return () => {
        };
    }, []);

    React.useEffect(() => {
        initializeSocket()
        return () => {
            socketRef.current?.disconnect();
        };
    }, [socketOrderId]);

    async function initializeSocket() {
        if (socketIOClient){
            let orderid = socketOrderId ? socketOrderId: "1"
            socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
                query: { orderid },
            });
            console.log('Initialize socket', orderid);

            // Listens for incoming messages
            socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
                console.log('Received Socket', message, orderid);
                if (message?.orderid == orderid) {
                    const updateLoc = (lat, lon) =>  {
                        let latitude = +lat, longitude = +lon
                        animate(latitude, longitude);
                        updateState({
                            heading: heading,
                            // curLoc: { latitude, longitude },
                            coordinate: new AnimatedRegion({
                                latitude: latitude,
                                longitude: longitude,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA
                            })
                        })
                    }
                    updateLoc(message?.latlon?.latitude, message?.latlon?.longitude)
                }
                // setMessages((messages) => [...messages, incomingMessage]);
            });
            
        }
    }

    const sendMessage = (messageBody) => {
        socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
          body: messageBody,
          senderId: socketRef.current?.id,
        });
    };

    async function getLoc(input = false) {
        // const check = hasLocationPermission()
        // if (check) {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log('Location Received:', position);
                if (input) {
                    const { latitude, longitude, heading } = position?.coords;
                    console.log("get live location after 4 second",heading)
                    // animate(latitude, longitude);
                    updateState({
                        heading: heading,
                        curLoc: { latitude, longitude },
                        destinationCords: new AnimatedRegion({
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA
                        })
                    })
                    // callAsyncRoute()
                }
            },
            (error) => {
                console.log('Error received:', error);
            },
            {
                accuracy: {
                    android: 'high',
                    ios: 'best',
                },
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: true,
                forceLocationManager: false,
                showLocationDialog: true,
            },
        );
        // } else {
        //   ToastAndroid.show(
        //     'Location permission not allowed by you.',
        //     ToastAndroid.LONG,
        //   );
        // }
    }

    async function requestLocationPermission(input = false) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location ACCESS_FINE_LOCATION Permission",
                    message:
                        "App needs access to your location fine",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the ACCESS_FINE_LOCATION");

                const granted2 = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    {
                        title: "Location ACCESS_COARSE_LOCATION Permission",
                        message:
                            "App needs access to your location coarse",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted2 === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the ACCESS_COARSE_LOCATION");

                    getLoc(true)

                } else {
                    console.log("ACCESS_COARSE_LOCATION permission denied");
                    alert("ACCESS_COARSE_LOCATION permission denied")
                }

            } else {
                console.log("ACCESS_FINE_LOCATION permission denied");
                alert("ACCESS_FINE_LOCATION permission denied")
            }
        } catch (err) {
            console.warn('Oops!', err);
            alert("Error cause! " + JSON.stringify(err))
        }
    };

    function animate(latitude, longitude) {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS == 'android') {
            if (markerRef.current) {
                markerRef.current.animateMarkerToCoordinate(newCoordinate, 500);
            }
        } else {
            coordinate.timing(newCoordinate).start();
        }
    }

    const onCenter = () => {
        mapRef.current.animateToRegion({
            // latitude: curLoc.latitude,
            // longitude: curLoc.longitude,
            latitude: destinationCords.latitude,
            longitude: destinationCords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    }


    // navigating marker
    async function callAsyncRoute() {
        let list = DataLatLon.default;
        let count = DataLatLon.default.length
        // console.log('list', count, DataLatLon);
        var i = 0;                  

        const updateLoc = (lat, lon) =>  {
            let latitude = +lat, longitude = +lon
            animate(latitude, longitude);
            updateState({
                heading: heading,
                // curLoc: { latitude, longitude },
                coordinate: new AnimatedRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                })
            })
        }

        function myLoop() {         
            setTimeout(function() {   
                // console.log('hello', i, list[i]);   //  your code here
                if (list[i]) {
                    updateLoc(list[i]?.latitude, list[i]?.longitude);
                }
                i++;                   
                // if (i < 10) {           
                //     myLoop();             
                // }  
                if (i < count) {
                    // const element = list[index];
                    myLoop();
                }                     
            }, 1000)
        }

        myLoop();          
    }

    return (
        <View style={styles.container}>
            <View style={styles.textview}>
                <Text style={styles.text}>{'Track Delivery Boy Location'}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ justifyContent: 'center', alignItems: 'center', right: 10, color: '#fff' }}>Order Id:</Text>
                    <TextInput
                        value={socketOrderId}
                        onChangeText={(text) => setsocketOrderId(text)}
                        style={{ color: '#fff',borderColor: '#fff', borderWidth: 1, borderRadius: 5, height: 40, width: 100 }}
                    />
                </View>
            </View>
            <MapViewAnimated
                style={styles.map}
                ref={mapRef}
                initialRegion={{
                    ...curLoc,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                }}
                // provider={PROVIDER_DEFAULT}
                provider={MapView.PROVIDER_GOOGLE}
                // mapType={Platform.OS == "android" ? "none" : "standard"}
                // rotateEnabled={true}
                // region={RegionChange}
                showsMyLocationButton={true}
                showsUserLocation={true}
                // followUserLocation={true}
                onRegionChangeComplete={region => {
                
                  console.log('onRegionChangeComplete', region);
                }}
                // showsScale={true}
                zoomControlEnabled={true}
                zoomEnabled={true}
                zoomTapEnabled={true} 
                // liteMode={true}
                >
                    <MarkerAnimated
                        // ref={markerRef}
                        // coordinate={coordinate}
                        pinColor={'transparent'}
                        coordinate={destinationCords}
                    >
                        <Image
                            source={Images.address}
                            style={{
                                width: 40,
                                height: 40,
                                // transform: [{rotate: `${heading-90}deg`}]
                            }}
                            resizeMode="contain"
                        />
                    </MarkerAnimated>
                    {Object.keys(destinationCords).length > 0 && (
                    <MarkerAnimated
                        ref={markerRef}
                        // coordinate={destinationCords}
                        coordinate={coordinate}
                        // tracksViewChanges={false}
                    >
                        <Image
                            source={Images.delivery}
                            style={{
                                width: 40,
                                height: 40,
                                // transform: [{rotate: `${heading}deg`}]
                                // transform: [{rotate: `${heading-90}deg`}]
                            }}
                            resizeMode="contain"
                        />
                    </MarkerAnimated>
                    )}
            </MapViewAnimated>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Pressable style={styles.footer}  /*onPress={onCenter}*/>
                    <Text style={{fontSize: 12}}>Source Region: {JSON.stringify(coordinate, null, 2)}</Text>
                    <Text style={{fontSize: 12}}>Destination Region: {JSON.stringify(destinationCords, null, 2)}</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    textview: { 
        position: 'absolute',
        top: 0, // bottom: 0, left: 0, right: 0,
        zIndex: 2,
        width: '60%',
        backgroundColor: '#a9f',
        flexDirection: 'column',
        alignSelf: 'center',
        justifyContent:'center',
        paddingVertical: '2%',borderRadius: 25, marginTop: '2%',
    },
    text:{
        alignSelf: 'center',paddingVertical: '1%',
        justifyContent:'center', color: '#fff',
        fontWeight: 'bold', alignItems: 'center', textAlign: 'center', // marginVertical: '5%', 
    },
    container: {
        flex: 1,
        height: Dimensions.get('screen').height
    },
    map: {
        // flex: 1,
        height:  Dimensions.get('window').height-200,
        width:  '100%',
        // ...StyleSheet.absoluteFillObject,
    },
    footer: {
        flex: 2,
        height: 200,
        flexDirection: 'row'
    },  
    item: {
        backgroundColor: '#6021ef',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 5
    },
    title: {
        fontSize: 16,
        color: '#fff'
    },
    subtitle: {
        fontSize: 10,
        color: '#fff'
    },
});

export default TrackByUser;