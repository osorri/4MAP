import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import * as Location from "expo-location";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const TIMEOUT = 12000;

function isText(v) {
    return typeof v === "string" && v.trim().length > 0;
}

function join(parts) {
    return parts.filter(isText).join(", ");
}

function formatFull(data) {
    if (isText(data?.display_name)) return data.display_name;

    const a = data?.address || {};

    const street = join([a.road || a.pedestrian, a.house_number]);
    const city = a.city || a.town || a.village || a.municipality || a.suburb;

    const line2 = join([a.postcode, city]);
    const line3 = join([a.county, a.state]);

    return join([street, line2, line3, a.country]) || "No address";
}

function formatShort(data) {
    const a = data?.address || {};
    const city = a.city || a.town || a.village || a.suburb;

    return (
        join([city, a.country]) ||
        join([a.state, a.county]) ||
        "Unknown location"
    );
}

function getErrorMessage(err) {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    if (err.name === "AbortError") return "Request timeout";
    return err.message || "Request error";
}

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
}

export default function App() {
    const [state, setState] = useState({
        status: "idle",
        lat: null,
        lon: null,
        full: "",
        short: "",
        updatedAt: "",
        error: "",
    });

    const requestId = useRef(0);

    const loading = state.status === "loading";
    const error = state.status === "error";
    const ready = state.status === "ready";

    const latText = useMemo(
        () => (typeof state.lat === "number" ? state.lat.toFixed(6) : "—"),
        [state.lat],
    );

    const lonText = useMemo(
        () => (typeof state.lon === "number" ? state.lon.toFixed(6) : "—"),
        [state.lon],
    );

    const getLocation = useCallback(async () => {
        const perm = await Location.requestForegroundPermissionsAsync();

        if (perm.status !== "granted") {
            throw new Error("Location permission denied");
        }

        return Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });
    }, []);

    const reverseGeocode = useCallback(async (lat, lon) => {
        const url = `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1`;

        const res = await fetchWithTimeout(url, {
            headers: {
                Accept: "application/json",
                "Accept-Language": "en-US",
                "User-Agent": "ExpoLocationApp/1.0",
            },
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
    }, []);

    const load = useCallback(async () => {
        const id = ++requestId.current;

        setState((s) => ({ ...s, status: "loading", error: "" }));

        try {
            const pos = await getLocation();
            if (id !== requestId.current) return;

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            const data = await reverseGeocode(lat, lon);
            if (id !== requestId.current) return;

            setState({
                status: "ready",
                lat,
                lon,
                full: data?.error ? "No data" : formatFull(data),
                short: data?.error ? "No data" : formatShort(data),
                updatedAt: new Date().toLocaleString("en-US"),
                error: "",
            });
        } catch (e) {
            if (id !== requestId.current) return;

            setState((s) => ({
                ...s,
                status: "error",
                error: getErrorMessage(e),
            }));
        }
    }, [getLocation, reverseGeocode]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Location</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Data</Text>

                    {loading && (
                        <View style={styles.center}>
                            <ActivityIndicator />
                            <Text style={styles.text}>Loading...</Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.center}>
                            <Text style={styles.error}>Error</Text>
                            <Text style={styles.text}>{state.error}</Text>
                        </View>
                    )}

                    {ready && (
                        <View>
                            <Text style={styles.text}>Lat: {latText}</Text>
                            <Text style={styles.text}>Lon: {lonText}</Text>

                            <Text style={styles.label}>Full address</Text>
                            <Text style={styles.text}>{state.full}</Text>

                            <Text style={styles.label}>Short address</Text>
                            <Text style={styles.text}>{state.short}</Text>

                            <Text style={styles.small}>
                                Updated: {state.updatedAt}
                            </Text>
                        </View>
                    )}
                </View>

                <Pressable style={styles.btn} onPress={load}>
                    <Text style={styles.btnText}>Refresh</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0f172a" },
    container: { padding: 20, gap: 16 },

    title: { fontSize: 30, color: "white", fontWeight: "700" },

    card: {
        backgroundColor: "#111827",
        padding: 16,
        borderRadius: 16,
    },

    cardTitle: { color: "white", fontSize: 18, marginBottom: 10 },

    text: { color: "#cbd5e1", marginBottom: 6 },

    label: { color: "#60a5fa", marginTop: 10, fontWeight: "700" },

    small: { color: "#64748b", marginTop: 10, fontSize: 12 },

    center: { alignItems: "center", padding: 20, gap: 8 },

    error: { color: "#f87171", fontWeight: "700" },

    btn: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
    },

    btnText: { color: "white", fontWeight: "700" },
});
