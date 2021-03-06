import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

/**
 * Connect ref
 * @param {firebase.database.Reference} ref ref of competition
 */
function createReferee(ref, isMain) {
    ref.child('ref/' + Constants.deviceId.substr(0, 16)).set({
        id: Constants.deviceId,
        delta: 0,
        running: false,
        main: isMain
    });
}

/**
 * Use refs
 * @param {firebase.database.Reference} ref return array of refs
 */
function useRefs() {
    const [refs, setRefs] = useState([]);
    useEffect(() => {
        let refs = [];
        let h = e => {
            refs = [...new Set([...refs, e.key])];
            setRefs(refs);
        };

        global.connection.child('ref/').on('child_added', h);
        return () => global.connection.child('ref/').off('child_added', h);
    }, []);

    return [refs];
}

/**
 * Use single referee
 * @param {firebase.database.Reference} ref return array of refs
 */
function useReferee(id) {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let running = false;
        let time = 0;
        let fixedTime = 0;
        let stTime = 0;

        let h = e => {
            let val = e.val();
            if (val.running != running) {
                running = val.running;
                if (running) stTime = new Date();
            }

            fixedTime = val.delta;
        };

        setInterval(() => {
            setTime(running ? new Date() - stTime : fixedTime);
        }, 100);

        global.connection.child('ref/' + id + '/').on('value', h);
        return () => global.connection.child('ref/' + id + '/').off('value', h);
    }, [id]);

    return [time];
}

export { createReferee, useRefs, useReferee };
