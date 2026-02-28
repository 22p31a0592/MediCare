import React from "react";

import { TouchableOpacity,Text,StyleSheet } from "react-native";

export function NavButton({icon : Icon, label, active, onClick}){
    return (
        <TouchableOpacity
        onPress={onClick}
        style={styles.button}
        >
            <Text>ICON</Text>
            <Text style={[
            styles.label, 
            active ? styles.activeLabel : styles.inactiveLabel
            ]}>
            {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles=StyleSheet.create({
    button: {
        alignItems : 'center',
        justifyContent : 'center',
        paddingHorizontal : 16,
        paddingVertical :  8,
    },
    label: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    activeLabel: {
        color: '#2563eb', // Blue when active
    },
    inactiveLabel: {
        color: '#6b7280', // Gray when inactive
    },

});
