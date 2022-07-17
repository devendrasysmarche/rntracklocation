/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
// import type {Node} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View, Button, TextInput,
    PermissionsAndroid, Platform, ToastAndroid, Linking, TouchableOpacity
} from 'react-native';


import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';
import BackgroundJob from 'react-native-background-actions';
import { createTable, deleteTable, getDBConnection, getTodoItems, saveLocation, saveTodoItems } from '../services/Db';

// socket post intializer
import socketIOClient from 'socket.io-client';
const SOCKET_SERVER_URL = "https://map-tracker-rn.herokuapp.com" // "http://localhost:4000"
const NEW_CHAT_MESSAGE_EVENT = "newLocationFound"; // Name of the event

/**
 * 
 * @Packages
 * https://github.com/andpor/react-native-sqlite-storage
 * https://www.npmjs.com/package/react-native-maps
 */

// // Sql Store
// // SQLite.openDatabase({name: 'tracklocation.db', location: 'Shared'}, successcb, errorcb);
// // SQLite.openDatabase("tracklocation.db", "1.0", "Demo", -1);
// // var db = SQLite.openDatabase("tracklocation.db", "1.0", "Tracklocation Database", 200000, successcb, errorcb);
// var db = openDatabase("tracklocation.db", "1.0", "Tracklocation Database", 200000, successcb, errorcb);
// function successcb(params) {
//     console.log('Db Created!', params);
// }
// function errorcb(params) {
//     console.log('Error creating db', params);
// }
// // Sql Store

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

BackgroundJob.on('expiration', () => {
    console.log('iOS: I am being closed!');
});

var globalSocket;
function getBackLoc(taskData) {
    const initAndSendToSocket = (data) => {
        try {
            let orderid = taskData?.orderid ? taskData?.orderid: "1"
            if (typeof globalSocket == 'undefined') {
                console.log('init globalsocket');
                globalSocket = socketIOClient(SOCKET_SERVER_URL, {
                    query: { orderid },
                });
            }
            globalSocket?.emit(NEW_CHAT_MESSAGE_EVENT, {"orderid":taskData?.orderid, "latlon":data, "action": "Background"});
        } catch (e) {
            console.log('error in socket bg', e);
        }
    }
    const saveDetailsInDb = async (details) => {
        try {
            console.log('save details', details);
            const initTodos = {
                accuracy: details?.coords?.accuracy,
                altitude: details?.coords?.altitude,
                latitude: details?.coords?.latitude,
                longitude: details?.coords?.longitude,
                orderid: taskData?.orderid ? taskData?.orderid : 1,
                timestamp: details?.timestamp,
                created: new Date().toString()
            };
            console.log('DBiniTodos', initTodos, 'orderid' + taskData?.orderid);
            const db = await getDBConnection();
            let data = {...initTodos, ...details}
            initAndSendToSocket(data)
            await saveLocation(db, initTodos).then(d => console.log('dt saved', d)).catch(e => console.log('err', e));
            console.log('Saved in table bg');
        } catch (error) {
            console.error('error in dbquery', error);
        }
    };
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log('Location Received In Background:', position);
                saveDetailsInDb(position)
                resolve(position)
            },
            (error) => {
                console.log('Error received:', error);
                resolve(error.toString())
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
    })
}

const taskRandom = async (taskData) => {
    if (Platform.OS === 'ios') {
        console.warn(
            'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
            'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.'
        );
    }
    await new Promise(async (resolve) => {
        // For loop with a delay
        const { delay } = taskData;
        console.log(BackgroundJob.isRunning(), delay, taskData)
        for (let i = 0; BackgroundJob.isRunning(); i++) {
            let getloc = await getBackLoc(taskData).catch(e => console.log('error', e))
            console.log('Runned -> ', i, getloc);
            let details = "Lat:"+getloc?.coords?.latitude+" & Long:"+getloc?.coords?.longitude;
            await BackgroundJob.updateNotification({ taskDesc: 'Runned -> ' + i + ' & Details: ' + details });
            await sleep(delay);
        }
    });
};


function handleOpenURL(evt) {
    console.log('handleOpenURL', evt.url);
    // do something with the url
}

Linking.addEventListener('url', handleOpenURL);


const Section = ({ children, title }) => {
    const isDarkMode = useColorScheme() === 'dark';


    return (
        <View style={styles.sectionContainer}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: isDarkMode ? Colors.white : Colors.black,
                    },
                ]}>
                {title}
            </Text>
            <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: isDarkMode ? Colors.light : Colors.dark,
                    },
                ]}>
                {children}
            </Text>
        </View>
    );
};

const DeliveryStart = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const [orderid, setorderid] = React.useState('1');
    let playing = BackgroundJob.isRunning();
    const [buttonBg, setbuttonBg] = React.useState(playing?"Stop Backgroundtask":"Press for backgroundtask");
    const [locationDetails, setlocationDetails] = React.useState(null);
    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    // socket state
    const socketRef = React.useRef();
    React.useEffect(() => {
        initializeSocket()
        return () => {
            socketRef.current?.disconnect();
        };
    }, [orderid]);
    async function initializeSocket() {
        if (socketIOClient){
            // let oid = orderid ? orderid: "1"
            socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
                query: { orderid },
            });
            console.log('Initialize socket', orderid);
        }
    }
    const sendMessage = (messageBody) => {
        socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {"orderid":orderid, "latlon":messageBody});
    };
    // socket end


    // sql store sample
    const loadDataCallback = React.useCallback(async () => {
        try {
            // const initTodos = [
            //     { id: 0, value: 'go to shop' }, 
            //     { id: 1, value: 'eat at least a one healthy foods' }, 
            //     { id: 2, value: 'Do some exercises' }
            // ];
            // console.log('iniTodos', initTodos);
            const db = await getDBConnection();

            // const dbt = await deleteTable(db)
            // console.log('deleted', dbt);
            await createTable(db);
            // const storedTodoItems = await getTodoItems(db);
            // if (storedTodoItems.length) {
            //     console.log('data in if',storedTodoItems);
            // } else {
            //     await saveTodoItems(db, initTodos);
            //     console.log('data in else,',initTodos);
            // }
        } catch (error) {
            console.error('error in dbquery', error);
        }
    }, []);

    const saveDetails = async (details) => {
        try {
            console.log('save details', details);
            const initTodos = {
                accuracy: details?.coords?.accuracy,
                altitude: details?.coords?.altitude,
                latitude: details?.coords?.latitude,
                longitude: details?.coords?.longitude,
                orderid: orderid ? orderid : 1,
                timestamp: details?.timestamp,
                created: new Date().toString()
            };
            console.log('iniTodos', initTodos, 'orderid' + orderid);
            const db = await getDBConnection();
            sendMessage({...initTodos, ...details})
            await saveLocation(db, initTodos).then(d => console.log('dt saved', d)).catch(e => console.log('err', e));
            // console.log('Saved in table');
        } catch (error) {
            console.error('error in dbquery', error);
        }
    };

    React.useEffect(() => {
        loadDataCallback();
    }, []);
    // sql store


    /**
     * Toggles the background task
     */
    const toggleBackground = async () => {
        playing = !playing;
        if (playing) {
            try {

                const options = {
                    taskName: 'trackme',
                    taskTitle: 'trackmeTask title',
                    taskDesc: 'trackmeTask desc',
                    taskIcon: {
                        name: 'ic_launcher',
                        type: 'mipmap',
                    },
                    color: '#ff00ff',
                    linkingURI: 'trackme://chat/jane',
                    parameters: {
                        delay: 5000,
                        orderid: orderid,
                        socketRef: socketRef.current
                    },
                };
                console.log('Trying  to start background service');
                await BackgroundJob.start(taskRandom, options);
                console.log('Successful start!');
                setbuttonBg("Stop backgroundtask")
            } catch (e) {
                console.log('Error', e);
                setbuttonBg("Press for backgroundtask")
            }
        } else {
            console.log('Stop background service');
            await BackgroundJob.stop();
            setbuttonBg("Press for backgroundtask")
        }
    };

    React.useEffect(() => {
        console.log('isBackground', playing);
        requestLocationPermission(true)
        return () => {

        };
    }, []);

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

                    const granted3 = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                        {
                            title: "Location ACCESS_BACKGROUND_LOCATION Permission",
                            message:
                                "App needs access to your location coarse",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    if (granted3 === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log("You can use the ACCESS_BACKGROUND_LOCATION");
                        getLoc(input)
                    } else {
                        console.log("ACCESS_BACKGROUND_LOCATION permission denied");
                        alert("ACCESS_BACKGROUND_LOCATION permission denied")
                    }

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

    async function getLoc(input = false) {
        // const check = hasLocationPermission()
        // if (check) {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log('Location Received:', position);
                if (input) {
                    setlocationDetails(position)
                    saveDetails(position)
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

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}>
                <View
                    style={{
                        backgroundColor: isDarkMode ? Colors.black : Colors.white,
                    }}>
                    <Section title="About">
                        Hello there!, Background Location  <Text style={styles.highlight}>Detection</Text>
                    </Section>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ justifyContent: 'center', alignItems: 'center', right: 10 }}>Order Id:</Text>
                        <TextInput
                            value={orderid}
                            onChangeText={(text) => setorderid(text)}
                            style={{ borderColor: 'black', borderWidth: 1, height: 40, width: 100 }}
                        />
                    </View>
                    <Text>{' '}</Text>
                    <Text style={{ marginHorizontal: '5%' }}>
                        {JSON.stringify(locationDetails, null, 2)}
                    </Text>
                    <View>
                        <Text>{' '}</Text>

                        <Button
                            title={buttonBg}
                            onPress={() =>
                                toggleBackground()
                            }
                        />
                        <Text>{' '}</Text>
                        <Button
                            title="Ask For Permission"
                            onPress={() =>
                                requestLocationPermission(true)
                            }
                        />
                        <Text>{' '}</Text>
                        <Button
                            title="Update Location"
                            onPress={() =>
                                getLoc(true)
                            }
                        />
                    </View>


                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default DeliveryStart;
