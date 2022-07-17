import * as React from 'react';
import {
    FlatList,
    Text, StyleSheet, View, Dimensions
} from 'react-native';
import { getDBConnection, getTodoItems } from '../services/Db';
// import Routing from 'react-native-leaflet-routing';
import mapLayers from '../constants/mapLayers';

const Leafletmap = ({ navigation }) => {
    const [mapLayerState, setMapLayerState] = React.useState({
        initialRegion: [
            45.72348047159787, 4.83214326115558
        ],
        ownPositionMarker: null,
        from: [
            45.76488848662397, 4.836387634277344
        ],
        to: [
            45.749797729939175, 4.873380661010743
        ],
        urlRouter: 'http://127.0.0.1:5000/route/v1',
        mapLayer: mapLayers[0],
        markers: []
    });
    // sql store sample
    const loadDataCallback = React.useCallback(async () => {
        // console.log('db0');
        try {
            console.log('db');
            let initialRegion = [45.72348047159787, 4.83214326115558];
            let ownPositionMarker = {
                id: 'position',
                coords: initialRegion
            };

            setMapLayerState({
                ...mapLayerState,
                ownPositionMarker,
                markers: [
                    {
                        id: 'marker1',
                        coords: [45.752432918044825, 4.841709136962891]
                    }, {
                        id: 'marker2',
                        coords: [45.741891419102785, 4.870891571044922]
                    }
                ]
            });

        } catch (error) {
            console.log('error in dbquery', error);
        }
    }, []);

    React.useEffect(() => {
        loadDataCallback();
    }, []);
    // sql store

    const {
        initialRegion,
        from,
        to,
        urlRouter,
        mapLayer,
        markers,
        ownPositionMarker
    } = mapLayerState;


    // events
    const eventReceiver = {
        onLoad: (event) => {
            console.log('onLoad received : ', event);
        },

        onUnload: (event) => {
            console.log('onUnload received : ', event);
        },

        onMapLoaded: (event) => {
            console.log('onMapLoaded received : ', event);
        },

        onUpdateMapState: (event) => {
            console.log('onUpdateMapState received : ', event);
        },

        onMapClicked: (event) => {
            console.log('onMapClicked received : ', event);
            this.showAlert('Map Clicked', `Coordinates = ${event.payload.coords}`);
        },

        onMapMarkerClicked: (event) => {
            console.log('onMapMarkerClicked received : ', event);
        },

        onZoom: (event) => {
            console.log('onZoom received : ', event);
        },

        onZoomStart: (event) => {
            console.log('onZoomEnd received : ', event);
        },

        onZoomEnd: (event) => {
            console.log('onZoomEnd received : ', event);
        },

        onZoomLevelsChange: (event) => {
            console.log('onZoomLevelsChange received : ', event);
        },

        onMove: (event) => {
            console.log('onMove received : ', event);
        },

        onMoveStart: (event) => {
            console.log('onMoveStart received : ', event);
        },

        onMoveEnd: (event) => {
            console.log('onMoveEnd received : ', event);
        },

        onCurrentPositionClicked: (event) => {
            console.log('onCurrentPositionClicked received : ', event);
        },

        onResize: (event) => {
            console.log('onResize received : ', event);
        },

        onViewReset: (event) => {
            console.log('onViewReset received : ', event);
        },

        onRoutesFound: (event) => {
            console.log('onRoutesFound received : ', event);
        },

        onRouteSelected: (event) => {
            console.log('onRouteSelected received : ', event);
        },

        onRouteError: (event) => {
            console.log('onRouteError received : ', event);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{'Track Delivery Boy Location'}</Text>
            {/* <Routing
                //optional : initial region displayed
                initialRegion={initialRegion}
                // optional: map layer
                mapLayer={mapLayer}
                // optional: own position
                ownPositionMarker={ownPositionMarker}
                // optional: coordinates of the starting point
                from={from}
                // optional: coordinates of the arriving point
                to={to}
                // optional : event functions
                eventReceiver={eventReceiver}
                // optional: url of routing server
                urlRouter={urlRouter}
                // optional: markers
                markers={markers} /> */}
        </View>
    );
};
const styles = StyleSheet.create({
    item: {
        backgroundColor: '#7998ae',
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
    text: {
        position: 'absolute',
        top: 0, // bottom: 0, left: 0, right: 0,
        zIndex: 2,
        width: '60%',
        backgroundColor: '#a9f',
        alignSelf: 'center',
        justifyContent: 'center',
        paddingVertical: '2%', borderRadius: 25, marginTop: '2%', color: '#fff',
        fontWeight: 'bold', alignItems: 'center', textAlign: 'center', // marginVertical: '5%', 
    },
    container: {
        flex: 1,
        height: Dimensions.get('screen').height
    },
});

export default Leafletmap;