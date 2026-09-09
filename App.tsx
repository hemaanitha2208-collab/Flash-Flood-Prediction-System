import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";

type Screen = "intro" | "dashboard" | "analysis" | "result" | "map" | "warning" | "final";

type RiskZone = { name: string; lat: number; lng: number; radiusKm: number; risk: "high" | "moderate" | "low"; pop: string };
type Region = {
  name: string;
  district: string;
  state: string;
  elevation: string;
  lat: number;
  lng: number;
  zoom: number;
  zones: RiskZone[];
  data: { label: string; value: string; unit: string; icon: string; level: string }[];
  result: "HIGH" | "MODERATE" | "LOW";
  resultColor: string;
  resultBorder: string;
  resultBg: string;
};

const regions: Region[] = [
  // ── Uttarakhand ──────────────────────────────────────────────
  {
    name: "Chamoli", district: "Chamoli", state: "Uttarakhand", elevation: "1,240",
    lat: 30.4087, lng: 79.3271, zoom: 11,
    zones: [
      { name: "Chamoli Town", lat: 30.4087, lng: 79.3271, radiusKm: 4.2, risk: "high", pop: "~3,800" },
      { name: "Gopeshwar", lat: 30.365, lng: 79.312, radiusKm: 3.0, risk: "high", pop: "~2,200" },
      { name: "Nandprayag", lat: 30.337, lng: 79.297, radiusKm: 2.5, risk: "moderate", pop: "~1,400" },
      { name: "Tharali", lat: 30.28, lng: 79.21, radiusKm: 2.0, risk: "moderate", pop: "~980" },
      { name: "Dewal", lat: 30.19, lng: 79.10, radiusKm: 1.8, risk: "low", pop: "~560" },
    ],
    data: [
      { label: "Rainfall", value: "185", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "52", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "19", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "94", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "88", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1240", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "34", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "5.6", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Rudraprayag", district: "Rudraprayag", state: "Uttarakhand", elevation: "895",
    lat: 30.2844, lng: 78.9806, zoom: 11,
    zones: [
      { name: "Rudraprayag Town", lat: 30.2844, lng: 78.9806, radiusKm: 3.8, risk: "high", pop: "~2,600" },
      { name: "Agastmuni", lat: 30.32, lng: 79.00, radiusKm: 2.8, risk: "high", pop: "~1,800" },
      { name: "Ukhimath", lat: 30.39, lng: 79.00, radiusKm: 2.2, risk: "moderate", pop: "~1,100" },
      { name: "Tilwara", lat: 30.24, lng: 78.95, radiusKm: 1.6, risk: "low", pop: "~640" },
    ],
    data: [
      { label: "Rainfall", value: "162", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "44", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "21", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "91", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "83", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "895", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "32", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "4.9", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Uttarkashi", district: "Uttarkashi", state: "Uttarakhand", elevation: "1,158",
    lat: 30.7268, lng: 78.4354, zoom: 11,
    zones: [
      { name: "Uttarkashi Town", lat: 30.7268, lng: 78.4354, radiusKm: 3.5, risk: "moderate", pop: "~3,200" },
      { name: "Bhatwari", lat: 30.82, lng: 78.48, radiusKm: 2.4, risk: "moderate", pop: "~1,500" },
      { name: "Maneri", lat: 30.73, lng: 78.40, radiusKm: 2.0, risk: "high", pop: "~900" },
      { name: "Dunda", lat: 30.69, lng: 78.38, radiusKm: 1.7, risk: "low", pop: "~720" },
    ],
    data: [
      { label: "Rainfall", value: "120", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "35", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "18", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "86", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "72", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1158", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "28", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.8", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  {
    name: "Tehri Garhwal", district: "Tehri", state: "Uttarakhand", elevation: "770",
    lat: 30.3906, lng: 78.4804, zoom: 11,
    zones: [
      { name: "New Tehri", lat: 30.3906, lng: 78.4804, radiusKm: 3.2, risk: "moderate", pop: "~2,900" },
      { name: "Chamba", lat: 30.35, lng: 78.43, radiusKm: 2.1, risk: "moderate", pop: "~1,300" },
      { name: "Narendra Nagar", lat: 30.41, lng: 78.52, radiusKm: 1.9, risk: "high", pop: "~870" },
      { name: "Kirtinagar", lat: 30.33, lng: 78.50, radiusKm: 1.5, risk: "low", pop: "~490" },
    ],
    data: [
      { label: "Rainfall", value: "98", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "27", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "23", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "80", unit: "%", icon: "💧", level: "moderate" },
      { label: "Soil Moisture", value: "66", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "770", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "26", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.1", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  {
    name: "Pithoragarh", district: "Pithoragarh", state: "Uttarakhand", elevation: "1,814",
    lat: 29.5825, lng: 80.2179, zoom: 11,
    zones: [
      { name: "Pithoragarh Town", lat: 29.5825, lng: 80.2179, radiusKm: 2.8, risk: "low", pop: "~2,100" },
      { name: "Munsiari", lat: 29.67, lng: 80.25, radiusKm: 2.0, risk: "moderate", pop: "~1,200" },
      { name: "Dharchula", lat: 29.85, lng: 80.53, radiusKm: 1.8, risk: "moderate", pop: "~980" },
      { name: "Askot", lat: 29.77, lng: 80.37, radiusKm: 1.4, risk: "low", pop: "~560" },
    ],
    data: [
      { label: "Rainfall", value: "75", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "20", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "16", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "74", unit: "%", icon: "💧", level: "moderate" },
      { label: "Soil Moisture", value: "56", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "1814", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "24", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "2.2", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "LOW", resultColor: "text-green-400", resultBorder: "border-green-500/40", resultBg: "from-green-500/10",
  },
  {
    name: "Bageshwar", district: "Bageshwar", state: "Uttarakhand", elevation: "960",
    lat: 29.8382, lng: 79.7691, zoom: 11,
    zones: [
      { name: "Bageshwar Town", lat: 29.8382, lng: 79.7691, radiusKm: 2.4, risk: "low", pop: "~1,800" },
      { name: "Kapkot", lat: 29.91, lng: 79.86, radiusKm: 1.8, risk: "low", pop: "~890" },
      { name: "Garur", lat: 29.76, lng: 79.71, radiusKm: 1.5, risk: "moderate", pop: "~640" },
    ],
    data: [
      { label: "Rainfall", value: "55", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "13", unit: "mm/hr", icon: "⛈", level: "normal" },
      { label: "Temperature", value: "20", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "68", unit: "%", icon: "💧", level: "normal" },
      { label: "Soil Moisture", value: "44", unit: "%", icon: "🌱", level: "normal" },
      { label: "Elevation", value: "960", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "20", unit: "°", icon: "📐", level: "normal" },
      { label: "River Level", value: "1.6", unit: "m", icon: "🏞", level: "normal" },
    ],
    result: "LOW", resultColor: "text-green-400", resultBorder: "border-green-500/40", resultBg: "from-green-500/10",
  },
  // ── Himachal Pradesh ─────────────────────────────────────────
  {
    name: "Kullu", district: "Kullu", state: "Himachal Pradesh", elevation: "1,220",
    lat: 31.9579, lng: 77.1095, zoom: 11,
    zones: [
      { name: "Kullu Town", lat: 31.9579, lng: 77.1095, radiusKm: 4.0, risk: "high", pop: "~4,200" },
      { name: "Manali", lat: 32.24, lng: 77.19, radiusKm: 3.2, risk: "high", pop: "~2,900" },
      { name: "Banjar", lat: 31.64, lng: 77.03, radiusKm: 2.5, risk: "moderate", pop: "~1,400" },
      { name: "Anni", lat: 31.50, lng: 77.11, radiusKm: 2.0, risk: "moderate", pop: "~870" },
      { name: "Sainj Valley", lat: 31.75, lng: 77.15, radiusKm: 1.6, risk: "low", pop: "~520" },
    ],
    data: [
      { label: "Rainfall", value: "148", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "41", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "17", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "89", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "79", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1220", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "30", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "4.4", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Mandi", district: "Mandi", state: "Himachal Pradesh", elevation: "850",
    lat: 31.7085, lng: 76.9319, zoom: 11,
    zones: [
      { name: "Mandi Town", lat: 31.7085, lng: 76.9319, radiusKm: 3.5, risk: "moderate", pop: "~3,600" },
      { name: "Sundernagar", lat: 31.53, lng: 76.91, radiusKm: 2.6, risk: "moderate", pop: "~1,800" },
      { name: "Jogindernagar", lat: 31.99, lng: 76.79, radiusKm: 2.0, risk: "high", pop: "~1,100" },
      { name: "Karsog", lat: 31.38, lng: 77.02, radiusKm: 1.5, risk: "low", pop: "~640" },
    ],
    data: [
      { label: "Rainfall", value: "105", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "30", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "22", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "82", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "69", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "850", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "27", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.5", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  {
    name: "Kangra", district: "Kangra", state: "Himachal Pradesh", elevation: "733",
    lat: 32.0998, lng: 76.2691, zoom: 11,
    zones: [
      { name: "Kangra Town", lat: 32.0998, lng: 76.2691, radiusKm: 3.0, risk: "moderate", pop: "~2,800" },
      { name: "Dharamshala", lat: 32.22, lng: 76.32, radiusKm: 2.5, risk: "moderate", pop: "~2,200" },
      { name: "Palampur", lat: 32.11, lng: 76.54, radiusKm: 2.0, risk: "high", pop: "~1,400" },
      { name: "Baijnath", lat: 32.05, lng: 76.65, radiusKm: 1.4, risk: "low", pop: "~670" },
    ],
    data: [
      { label: "Rainfall", value: "88", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "24", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "25", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "77", unit: "%", icon: "💧", level: "moderate" },
      { label: "Soil Moisture", value: "60", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "733", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "22", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "2.8", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  {
    name: "Chamba", district: "Chamba", state: "Himachal Pradesh", elevation: "996",
    lat: 32.5536, lng: 76.1291, zoom: 11,
    zones: [
      { name: "Chamba Town", lat: 32.5536, lng: 76.1291, radiusKm: 2.5, risk: "low", pop: "~2,400" },
      { name: "Dalhousie", lat: 32.53, lng: 75.98, radiusKm: 1.8, risk: "low", pop: "~1,100" },
      { name: "Bharmour", lat: 32.44, lng: 76.53, radiusKm: 1.5, risk: "moderate", pop: "~640" },
    ],
    data: [
      { label: "Rainfall", value: "60", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "15", unit: "mm/hr", icon: "⛈", level: "normal" },
      { label: "Temperature", value: "18", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "70", unit: "%", icon: "💧", level: "normal" },
      { label: "Soil Moisture", value: "47", unit: "%", icon: "🌱", level: "normal" },
      { label: "Elevation", value: "996", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "21", unit: "°", icon: "📐", level: "normal" },
      { label: "River Level", value: "1.8", unit: "m", icon: "🏞", level: "normal" },
    ],
    result: "LOW", resultColor: "text-green-400", resultBorder: "border-green-500/40", resultBg: "from-green-500/10",
  },
  {
    name: "Shimla", district: "Shimla", state: "Himachal Pradesh", elevation: "2,206",
    lat: 31.1048, lng: 77.1734, zoom: 12,
    zones: [
      { name: "Shimla City", lat: 31.1048, lng: 77.1734, radiusKm: 2.2, risk: "low", pop: "~3,500" },
      { name: "Rampur", lat: 31.46, lng: 77.63, radiusKm: 1.8, risk: "low", pop: "~1,200" },
      { name: "Rohru", lat: 31.21, lng: 77.75, radiusKm: 1.4, risk: "moderate", pop: "~780" },
    ],
    data: [
      { label: "Rainfall", value: "44", unit: "mm", icon: "🌧", level: "normal" },
      { label: "Rainfall Intensity", value: "9", unit: "mm/hr", icon: "⛈", level: "normal" },
      { label: "Temperature", value: "12", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "63", unit: "%", icon: "💧", level: "normal" },
      { label: "Soil Moisture", value: "38", unit: "%", icon: "🌱", level: "normal" },
      { label: "Elevation", value: "2206", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "18", unit: "°", icon: "📐", level: "normal" },
      { label: "River Level", value: "0.9", unit: "m", icon: "🏞", level: "normal" },
    ],
    result: "LOW", resultColor: "text-green-400", resultBorder: "border-green-500/40", resultBg: "from-green-500/10",
  },
  // ── Jammu & Kashmir ──────────────────────────────────────────
  {
    name: "Doda", district: "Doda", state: "Jammu & Kashmir", elevation: "1,100",
    lat: 33.1492, lng: 75.5432, zoom: 11,
    zones: [
      { name: "Doda Town", lat: 33.1492, lng: 75.5432, radiusKm: 3.8, risk: "high", pop: "~2,600" },
      { name: "Bhaderwah", lat: 32.98, lng: 75.72, radiusKm: 2.8, risk: "high", pop: "~1,800" },
      { name: "Gandoh", lat: 33.20, lng: 75.62, radiusKm: 2.0, risk: "moderate", pop: "~980" },
      { name: "Thathri", lat: 33.22, lng: 75.47, radiusKm: 1.5, risk: "low", pop: "~540" },
    ],
    data: [
      { label: "Rainfall", value: "135", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "38", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "15", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "88", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "75", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1100", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "33", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "4.1", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Ramban", district: "Ramban", state: "Jammu & Kashmir", elevation: "860",
    lat: 33.2432, lng: 75.2365, zoom: 11,
    zones: [
      { name: "Ramban Town", lat: 33.2432, lng: 75.2365, radiusKm: 3.2, risk: "moderate", pop: "~2,100" },
      { name: "Banihal", lat: 33.42, lng: 75.20, radiusKm: 2.4, risk: "moderate", pop: "~1,400" },
      { name: "Batote", lat: 33.12, lng: 75.14, radiusKm: 1.8, risk: "high", pop: "~870" },
      { name: "Sangaldan", lat: 33.32, lng: 75.27, radiusKm: 1.4, risk: "low", pop: "~460" },
    ],
    data: [
      { label: "Rainfall", value: "110", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "32", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "20", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "83", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "70", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "860", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "29", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "3.6", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  // ── Meghalaya ─────────────────────────────────────────────────
  {
    name: "Cherrapunji", district: "East Khasi Hills", state: "Meghalaya", elevation: "1,484",
    lat: 25.2801, lng: 91.7264, zoom: 11,
    zones: [
      { name: "Sohra (Cherrapunji)", lat: 25.2801, lng: 91.7264, radiusKm: 5.0, risk: "high", pop: "~4,800" },
      { name: "Mawsynram", lat: 25.30, lng: 91.58, radiusKm: 4.0, risk: "high", pop: "~2,800" },
      { name: "Mawkyrwat", lat: 25.12, lng: 91.61, radiusKm: 3.0, risk: "high", pop: "~1,600" },
      { name: "Pynursla", lat: 25.36, lng: 91.80, radiusKm: 2.2, risk: "moderate", pop: "~1,100" },
      { name: "Nongstoin", lat: 25.52, lng: 91.28, radiusKm: 1.8, risk: "low", pop: "~680" },
    ],
    data: [
      { label: "Rainfall", value: "310", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "85", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "20", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "98", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "95", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1484", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "36", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "7.2", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Shillong", district: "East Khasi Hills", state: "Meghalaya", elevation: "1,496",
    lat: 25.5788, lng: 91.8933, zoom: 12,
    zones: [
      { name: "Shillong City", lat: 25.5788, lng: 91.8933, radiusKm: 3.5, risk: "moderate", pop: "~5,200" },
      { name: "Mawlai", lat: 25.61, lng: 91.91, radiusKm: 2.4, risk: "moderate", pop: "~2,100" },
      { name: "Laitumkhrah", lat: 25.57, lng: 91.90, radiusKm: 1.8, risk: "high", pop: "~1,400" },
      { name: "Mawkhar", lat: 25.54, lng: 91.88, radiusKm: 1.4, risk: "low", pop: "~780" },
    ],
    data: [
      { label: "Rainfall", value: "140", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "40", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "17", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "86", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "74", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1496", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "25", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.9", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  // ── Sikkim ───────────────────────────────────────────────────
  {
    name: "Gangtok", district: "East Sikkim", state: "Sikkim", elevation: "1,650",
    lat: 27.3389, lng: 88.6065, zoom: 11,
    zones: [
      { name: "Gangtok City", lat: 27.3389, lng: 88.6065, radiusKm: 4.2, risk: "high", pop: "~4,000" },
      { name: "Rangpo", lat: 27.18, lng: 88.54, radiusKm: 3.0, risk: "high", pop: "~2,200" },
      { name: "Singtam", lat: 27.23, lng: 88.50, radiusKm: 2.4, risk: "moderate", pop: "~1,600" },
      { name: "Rongli", lat: 27.21, lng: 88.76, radiusKm: 1.8, risk: "low", pop: "~760" },
    ],
    data: [
      { label: "Rainfall", value: "175", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "48", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "14", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "92", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "82", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1650", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "35", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "5.1", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Mangan", district: "North Sikkim", state: "Sikkim", elevation: "1,000",
    lat: 27.5094, lng: 88.5323, zoom: 11,
    zones: [
      { name: "Mangan Town", lat: 27.5094, lng: 88.5323, radiusKm: 3.6, risk: "high", pop: "~1,800" },
      { name: "Chungthang", lat: 27.63, lng: 88.64, radiusKm: 2.8, risk: "high", pop: "~1,100" },
      { name: "Lachen", lat: 27.73, lng: 88.56, radiusKm: 2.0, risk: "moderate", pop: "~680" },
      { name: "Lachung", lat: 27.69, lng: 88.74, radiusKm: 1.6, risk: "low", pop: "~420" },
    ],
    data: [
      { label: "Rainfall", value: "130", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "36", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "16", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "87", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "73", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1000", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "31", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "4.0", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  // ── Arunachal Pradesh ────────────────────────────────────────
  {
    name: "Tawang", district: "Tawang", state: "Arunachal Pradesh", elevation: "2,669",
    lat: 27.5861, lng: 91.8594, zoom: 11,
    zones: [
      { name: "Tawang Town", lat: 27.5861, lng: 91.8594, radiusKm: 3.0, risk: "moderate", pop: "~1,600" },
      { name: "Zemithang", lat: 27.70, lng: 91.68, radiusKm: 2.2, risk: "moderate", pop: "~780" },
      { name: "Lumla", lat: 27.52, lng: 91.70, radiusKm: 1.6, risk: "low", pop: "~540" },
    ],
    data: [
      { label: "Rainfall", value: "92", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "25", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "8", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "76", unit: "%", icon: "💧", level: "moderate" },
      { label: "Soil Moisture", value: "58", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "2669", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "28", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "2.5", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  {
    name: "Itanagar", district: "Papum Pare", state: "Arunachal Pradesh", elevation: "380",
    lat: 27.0844, lng: 93.6053, zoom: 11,
    zones: [
      { name: "Itanagar City", lat: 27.0844, lng: 93.6053, radiusKm: 4.0, risk: "high", pop: "~3,800" },
      { name: "Naharlagun", lat: 27.10, lng: 93.70, radiusKm: 3.0, risk: "high", pop: "~2,400" },
      { name: "Banderdewa", lat: 27.15, lng: 93.75, radiusKm: 2.2, risk: "moderate", pop: "~1,200" },
      { name: "Yupia", lat: 27.05, lng: 93.57, radiusKm: 1.6, risk: "low", pop: "~620" },
    ],
    data: [
      { label: "Rainfall", value: "155", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "43", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "26", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "90", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "78", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "380", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "29", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "4.7", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  // ── Nagaland ─────────────────────────────────────────────────
  {
    name: "Kohima", district: "Kohima", state: "Nagaland", elevation: "1,444",
    lat: 25.6746, lng: 94.1086, zoom: 11,
    zones: [
      { name: "Kohima City", lat: 25.6746, lng: 94.1086, radiusKm: 3.5, risk: "moderate", pop: "~3,200" },
      { name: "Phek", lat: 25.64, lng: 94.47, radiusKm: 2.5, risk: "moderate", pop: "~1,500" },
      { name: "Viswema", lat: 25.61, lng: 94.13, radiusKm: 1.8, risk: "high", pop: "~870" },
      { name: "Chedema", lat: 25.69, lng: 94.09, radiusKm: 1.4, risk: "low", pop: "~510" },
    ],
    data: [
      { label: "Rainfall", value: "118", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "33", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "19", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "84", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "71", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "1444", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "26", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.2", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  // ── Mizoram ──────────────────────────────────────────────────
  {
    name: "Aizawl", district: "Aizawl", state: "Mizoram", elevation: "1,132",
    lat: 23.7271, lng: 92.7176, zoom: 11,
    zones: [
      { name: "Aizawl City", lat: 23.7271, lng: 92.7176, radiusKm: 4.2, risk: "high", pop: "~4,600" },
      { name: "Lunglei", lat: 22.89, lng: 92.73, radiusKm: 3.2, risk: "high", pop: "~2,200" },
      { name: "Champhai", lat: 23.46, lng: 93.33, radiusKm: 2.4, risk: "moderate", pop: "~1,400" },
      { name: "Serchhip", lat: 23.31, lng: 92.85, radiusKm: 1.8, risk: "low", pop: "~680" },
    ],
    data: [
      { label: "Rainfall", value: "145", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "40", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "22", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "88", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "76", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1132", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "30", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "4.3", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  // ── West Bengal ──────────────────────────────────────────────
  {
    name: "Darjeeling", district: "Darjeeling", state: "West Bengal", elevation: "2,042",
    lat: 27.0360, lng: 88.2627, zoom: 12,
    zones: [
      { name: "Darjeeling Town", lat: 27.0360, lng: 88.2627, radiusKm: 3.8, risk: "high", pop: "~3,400" },
      { name: "Kurseong", lat: 26.88, lng: 88.28, radiusKm: 2.8, risk: "high", pop: "~2,100" },
      { name: "Mirik", lat: 26.89, lng: 88.18, radiusKm: 2.2, risk: "moderate", pop: "~1,200" },
      { name: "Sukhiapokhri", lat: 27.06, lng: 88.22, radiusKm: 1.6, risk: "low", pop: "~650" },
    ],
    data: [
      { label: "Rainfall", value: "168", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "46", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "15", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "91", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "80", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "2042", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "33", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "4.8", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Kalimpong", district: "Kalimpong", state: "West Bengal", elevation: "1,250",
    lat: 27.0669, lng: 88.4715, zoom: 12,
    zones: [
      { name: "Kalimpong Town", lat: 27.0669, lng: 88.4715, radiusKm: 3.2, risk: "moderate", pop: "~2,800" },
      { name: "Gorubathan", lat: 26.89, lng: 88.51, radiusKm: 2.2, risk: "moderate", pop: "~1,300" },
      { name: "Lava", lat: 27.01, lng: 88.65, radiusKm: 1.6, risk: "high", pop: "~720" },
      { name: "Pedong", lat: 27.04, lng: 88.57, radiusKm: 1.2, risk: "low", pop: "~410" },
    ],
    data: [
      { label: "Rainfall", value: "115", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "32", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "18", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "85", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "68", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "1250", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "28", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.4", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  // ── Kerala ───────────────────────────────────────────────────
  {
    name: "Wayanad", district: "Wayanad", state: "Kerala", elevation: "700",
    lat: 11.6854, lng: 76.1320, zoom: 11,
    zones: [
      { name: "Kalpetta", lat: 11.6085, lng: 76.0827, radiusKm: 4.5, risk: "high", pop: "~4,200" },
      { name: "Mananthavady", lat: 11.80, lng: 76.00, radiusKm: 3.5, risk: "high", pop: "~2,800" },
      { name: "Sulthan Bathery", lat: 11.66, lng: 76.26, radiusKm: 2.8, risk: "high", pop: "~2,100" },
      { name: "Ambalavayal", lat: 11.65, lng: 76.18, radiusKm: 2.0, risk: "moderate", pop: "~1,300" },
      { name: "Vythiri", lat: 11.56, lng: 76.02, radiusKm: 1.6, risk: "low", pop: "~640" },
    ],
    data: [
      { label: "Rainfall", value: "210", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "60", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "26", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "97", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "91", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "700", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "29", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "6.2", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Munnar", district: "Idukki", state: "Kerala", elevation: "1,600",
    lat: 10.0892, lng: 77.0595, zoom: 12,
    zones: [
      { name: "Munnar Town", lat: 10.0892, lng: 77.0595, radiusKm: 4.0, risk: "high", pop: "~2,400" },
      { name: "Devikulam", lat: 10.06, lng: 77.11, radiusKm: 3.0, risk: "high", pop: "~1,600" },
      { name: "Chinnakanal", lat: 10.02, lng: 77.09, radiusKm: 2.2, risk: "moderate", pop: "~980" },
      { name: "Rajakkad", lat: 10.12, lng: 77.16, radiusKm: 1.6, risk: "low", pop: "~520" },
    ],
    data: [
      { label: "Rainfall", value: "155", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "44", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "20", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "92", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "83", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1600", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "27", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "4.6", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Idukki", district: "Idukki", state: "Kerala", elevation: "1,200",
    lat: 9.8541, lng: 76.9720, zoom: 11,
    zones: [
      { name: "Idukki Town", lat: 9.8541, lng: 76.9720, radiusKm: 3.2, risk: "moderate", pop: "~2,100" },
      { name: "Thodupuzha", lat: 9.89, lng: 76.72, radiusKm: 2.4, risk: "moderate", pop: "~1,600" },
      { name: "Adimali", lat: 10.00, lng: 76.97, radiusKm: 1.8, risk: "high", pop: "~920" },
      { name: "Nedumkandam", lat: 9.98, lng: 77.09, radiusKm: 1.4, risk: "low", pop: "~570" },
    ],
    data: [
      { label: "Rainfall", value: "100", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "28", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "24", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "84", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "70", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "1200", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "23", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.3", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
  // ── Karnataka ────────────────────────────────────────────────
  {
    name: "Kodagu (Coorg)", district: "Kodagu", state: "Karnataka", elevation: "1,525",
    lat: 12.3375, lng: 75.8069, zoom: 11,
    zones: [
      { name: "Madikeri", lat: 12.3375, lng: 75.8069, radiusKm: 2.8, risk: "low", pop: "~2,200" },
      { name: "Virajpet", lat: 12.19, lng: 75.80, radiusKm: 2.0, risk: "low", pop: "~1,400" },
      { name: "Somwarpet", lat: 12.60, lng: 75.93, radiusKm: 1.6, risk: "moderate", pop: "~920" },
      { name: "Kushalnagar", lat: 12.46, lng: 75.96, radiusKm: 1.2, risk: "low", pop: "~570" },
    ],
    data: [
      { label: "Rainfall", value: "62", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "14", unit: "mm/hr", icon: "⛈", level: "normal" },
      { label: "Temperature", value: "22", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "71", unit: "%", icon: "💧", level: "moderate" },
      { label: "Soil Moisture", value: "48", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "1525", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "19", unit: "°", icon: "📐", level: "normal" },
      { label: "River Level", value: "1.4", unit: "m", icon: "🏞", level: "normal" },
    ],
    result: "LOW", resultColor: "text-green-400", resultBorder: "border-green-500/40", resultBg: "from-green-500/10",
  },
  {
    name: "Chikkamagaluru", district: "Chikkamagaluru", state: "Karnataka", elevation: "1,090",
    lat: 13.3153, lng: 75.7754, zoom: 11,
    zones: [
      { name: "Chikkamagaluru Town", lat: 13.3153, lng: 75.7754, radiusKm: 2.6, risk: "low", pop: "~2,600" },
      { name: "Mudigere", lat: 13.13, lng: 75.64, radiusKm: 1.8, risk: "low", pop: "~1,100" },
      { name: "Kalasa", lat: 13.22, lng: 75.35, radiusKm: 1.4, risk: "moderate", pop: "~680" },
      { name: "Sringeri", lat: 13.42, lng: 75.25, radiusKm: 1.2, risk: "low", pop: "~420" },
    ],
    data: [
      { label: "Rainfall", value: "78", unit: "mm", icon: "🌧", level: "moderate" },
      { label: "Rainfall Intensity", value: "19", unit: "mm/hr", icon: "⛈", level: "normal" },
      { label: "Temperature", value: "24", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "74", unit: "%", icon: "💧", level: "moderate" },
      { label: "Soil Moisture", value: "53", unit: "%", icon: "🌱", level: "moderate" },
      { label: "Elevation", value: "1090", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "20", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "1.9", unit: "m", icon: "🏞", level: "normal" },
    ],
    result: "LOW", resultColor: "text-green-400", resultBorder: "border-green-500/40", resultBg: "from-green-500/10",
  },
  // ── Maharashtra ──────────────────────────────────────────────
  {
    name: "Mahabaleshwar", district: "Satara", state: "Maharashtra", elevation: "1,439",
    lat: 17.9307, lng: 73.6477, zoom: 12,
    zones: [
      { name: "Mahabaleshwar Town", lat: 17.9307, lng: 73.6477, radiusKm: 4.5, risk: "high", pop: "~2,100" },
      { name: "Panchgani", lat: 17.92, lng: 73.80, radiusKm: 3.4, risk: "high", pop: "~1,600" },
      { name: "Wai", lat: 17.95, lng: 73.89, radiusKm: 2.6, risk: "moderate", pop: "~1,200" },
      { name: "Medha", lat: 17.82, lng: 73.67, radiusKm: 2.0, risk: "moderate", pop: "~720" },
      { name: "Tapola", lat: 17.75, lng: 73.62, radiusKm: 1.4, risk: "low", pop: "~380" },
    ],
    data: [
      { label: "Rainfall", value: "195", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "55", unit: "mm/hr", icon: "⛈", level: "high" },
      { label: "Temperature", value: "21", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "95", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "87", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "1439", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "31", unit: "°", icon: "📐", level: "high" },
      { label: "River Level", value: "5.4", unit: "m", icon: "🏞", level: "high" },
    ],
    result: "HIGH", resultColor: "text-red-400", resultBorder: "border-red-500/40", resultBg: "from-red-500/10",
  },
  {
    name: "Lonavala", district: "Pune", state: "Maharashtra", elevation: "622",
    lat: 18.7481, lng: 73.4072, zoom: 12,
    zones: [
      { name: "Lonavala Town", lat: 18.7481, lng: 73.4072, radiusKm: 3.5, risk: "moderate", pop: "~2,600" },
      { name: "Khandala", lat: 18.76, lng: 73.38, radiusKm: 2.6, risk: "moderate", pop: "~1,400" },
      { name: "Karla", lat: 18.78, lng: 73.47, radiusKm: 2.0, risk: "high", pop: "~860" },
      { name: "Bhushi Dam Area", lat: 18.74, lng: 73.41, radiusKm: 1.4, risk: "high", pop: "~480" },
      { name: "Tungarli", lat: 18.73, lng: 73.39, radiusKm: 1.0, risk: "low", pop: "~290" },
    ],
    data: [
      { label: "Rainfall", value: "130", unit: "mm", icon: "🌧", level: "high" },
      { label: "Rainfall Intensity", value: "37", unit: "mm/hr", icon: "⛈", level: "moderate" },
      { label: "Temperature", value: "23", unit: "°C", icon: "🌡", level: "normal" },
      { label: "Humidity", value: "88", unit: "%", icon: "💧", level: "high" },
      { label: "Soil Moisture", value: "74", unit: "%", icon: "🌱", level: "high" },
      { label: "Elevation", value: "622", unit: "m", icon: "⛰", level: "normal" },
      { label: "Slope", value: "26", unit: "°", icon: "📐", level: "moderate" },
      { label: "River Level", value: "3.7", unit: "m", icon: "🏞", level: "moderate" },
    ],
    result: "MODERATE", resultColor: "text-yellow-400", resultBorder: "border-yellow-500/40", resultBg: "from-yellow-500/10",
  },
];

const analysisSteps = [
  "Rainfall analyzed",
  "Soil moisture analyzed",
  "Terrain parameters analyzed",
  "River level analyzed",
  "Environmental conditions processed",
];


const envData = [
  { label: "Rainfall", value: "120", unit: "mm", icon: "🌧", level: "high" },
  { label: "Rainfall Intensity", value: "35", unit: "mm/hr", icon: "⛈", level: "moderate" },
  { label: "Temperature", value: "24", unit: "°C", icon: "🌡", level: "normal" },
  { label: "Humidity", value: "86", unit: "%", icon: "💧", level: "high" },
  { label: "Soil Moisture", value: "72", unit: "%", icon: "🌱", level: "high" },
  { label: "Elevation", value: "850", unit: "m", icon: "⛰", level: "normal" },
  { label: "Slope", value: "28", unit: "°", icon: "📐", level: "moderate" },
  { label: "River Level", value: "3.8", unit: "m", icon: "🏞", level: "moderate" },
];

function useFadeIn(active: boolean) {
  const [cls, setCls] = useState("opacity-0 translate-y-4");
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setCls("opacity-100 translate-y-0"), 30);
      return () => clearTimeout(t);
    } else {
      setCls("opacity-0 translate-y-4");
    }
  }, [active]);
  return cls;
}

function levelColor(level: string) {
  if (level === "high") return "text-red-400 bg-red-500/10 border-red-500/30";
  if (level === "moderate") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  if (level === "normal") return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  return "text-green-400 bg-green-500/10 border-green-500/30";
}


// ─── Screen 1: Intro ─────────────────────────────────────────────────────────
function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const fc = useFadeIn(true);
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050d1a]">
      {/* Mountain SVG background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050d1a" />
            <stop offset="100%" stopColor="#0a1f3d" />
          </linearGradient>
          <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d2847" />
            <stop offset="100%" stopColor="#061220" />
          </linearGradient>
          <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1e38" />
            <stop offset="100%" stopColor="#050d1a" />
          </linearGradient>
          <linearGradient id="mtn3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071626" />
            <stop offset="100%" stopColor="#030a14" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#skyGrad)" />
        {/* Far mountains */}
        <polygon points="0,500 200,220 400,380 600,180 800,320 1000,150 1200,280 1440,200 1440,900 0,900" fill="url(#mtn1)" opacity="0.6" />
        {/* Mid mountains */}
        <polygon points="0,600 150,380 300,480 500,280 700,420 900,260 1100,380 1300,300 1440,360 1440,900 0,900" fill="url(#mtn2)" opacity="0.8" />
        {/* Foreground */}
        <polygon points="0,750 100,600 250,680 400,560 600,650 800,540 1000,640 1200,570 1440,620 1440,900 0,900" fill="url(#mtn3)" />
        {/* Rain streaks */}
        {Array.from({ length: 80 }).map((_, i) => (
          <line
            key={i}
            x1={Math.random() * 1440}
            y1={Math.random() * 900}
            x2={Math.random() * 1440 - 20}
            y2={Math.random() * 900 + 40}
            stroke="#3b82f6"
            strokeWidth="0.6"
            opacity={0.12 + Math.random() * 0.18}
          />
        ))}
        {/* Clouds */}
        <ellipse cx="200" cy="140" rx="180" ry="60" fill="#0c2244" opacity="0.7" />
        <ellipse cx="900" cy="100" rx="220" ry="70" fill="#0c2244" opacity="0.6" />
        <ellipse cx="1300" cy="160" rx="160" ry="50" fill="#0c2244" opacity="0.5" />
      </svg>

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className={`relative z-10 text-center px-8 transition-all duration-700 ease-out ${fc}`}>
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-300 text-xs font-mono tracking-widest uppercase">
            SIH26192 · Disaster Management
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-3 leading-none">
          FLASH FLOOD
          <span className="block text-blue-400">PREDICTION SYSTEM</span>
        </h1>
        <p className="text-slate-400 text-lg mb-2">For Hilly Regions using Multi-Source Data</p>
        <p className="text-slate-500 text-sm font-mono mb-12">
          AI-Powered · Real-Time · Multi-Source Data Fusion
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: "🛰", label: "Satellite Data" },
            { icon: "🌊", label: "Hydrological Model" },
            { icon: "📡", label: "IoT Sensors" },
            { icon: "🤖", label: "ML Prediction" },
            { icon: "🔔", label: "Early Warning" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onEnter}
          className="group relative px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-lg transition-all duration-200 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-100"
        >
          <span className="flex items-center gap-3">
            ENTER MONITORING DASHBOARD
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        <p className="mt-6 text-slate-600 text-xs">
          Smart India Hackathon 2026 · Prototype Demonstration
        </p>
      </div>
    </div>
  );
}

// ─── Real-time Rainfall Chart ─────────────────────────────────────────────────
function buildHistory(baseVal: number) {
  const now = new Date();
  const pts = [];
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000);
    const label = h.getHours().toString().padStart(2, "0") + ":00";
    const frac = (24 - i) / 24;
    const noise = (Math.random() - 0.4) * baseVal * 0.25;
    const val = Math.max(0, Math.round(baseVal * frac * 0.7 + noise));
    pts.push({ time: label, mm: val });
  }
  return pts;
}

function RainfallChart({ region }: { region: Region }) {
  const base = parseFloat(region.data[0].value);
  const [data, setData] = useState(() => buildHistory(base));
  const [live, setLive] = useState(base);

  useEffect(() => {
    setData(buildHistory(base));
    setLive(base);
  }, [region.name, base]);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const label = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
      const noise = (Math.random() - 0.35) * base * 0.12;
      const next = Math.max(0, Math.round(live + noise));
      setLive(next);
      setData((prev) => {
        const updated = [...prev.slice(1), { time: label, mm: next }];
        return updated;
      });
    }, 3000);
    return () => clearInterval(t);
  }, [live, base]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#0a1628] border border-blue-500/30 rounded-lg px-3 py-2 text-xs shadow-xl">
          <div className="text-slate-400 mb-1">{label}</div>
          <div className="text-blue-300 font-bold">{payload[0].value} mm/hr</div>
        </div>
      );
    }
    return null;
  };

  const maxVal = Math.max(...data.map((d) => d.mm), 10);
  const alertLine = base * 0.75;

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-slate-500 uppercase tracking-widest">
          Hourly Rainfall · {region.name} · Live
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-blue-400 font-mono font-bold">{live} mm/hr now</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#475569", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            domain={[0, maxVal * 1.2]}
            unit=" mm"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={alertLine} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1} label={{ value: "Alert", fill: "#f59e0b", fontSize: 9 }} />
          <Area
            type="monotone"
            dataKey="mm"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#rainGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 1 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}

// ─── Screen 2: Dashboard ──────────────────────────────────────────────────────
function DashboardScreen({
  onPredict,
  regionIdx,
  setRegionIdx,
}: {
  onPredict: () => void;
  regionIdx: number;
  setRegionIdx: (i: number) => void;
}) {
  const fc = useFadeIn(true);
  const [time, setTime] = useState(new Date());
  const [dropOpen, setDropOpen] = useState(false);
  const [search, setSearch] = useState("");
  const region = regions[regionIdx];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const alertDot =
    region.result === "HIGH" ? "bg-red-400" :
    region.result === "MODERATE" ? "bg-yellow-400" : "bg-green-400";
  const alertColor =
    region.result === "HIGH" ? "text-red-400" :
    region.result === "MODERATE" ? "text-yellow-400" : "text-green-400";

  return (
    <div className="min-h-screen bg-[#070f1e] text-white">
      {/* Top bar */}
      <div className="border-b border-white/8 bg-[#0a1628]/80 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-sm font-black">FF</div>
          <div>
            <div className="text-sm font-bold text-white leading-none">FFPS Dashboard</div>
            <div className="text-[10px] text-slate-500 font-mono">Flash Flood Prediction System</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
          <span>{time.toLocaleTimeString()}</span>
          <span className="text-blue-400">SIH26192</span>
        </div>
      </div>

      <div className={`max-w-6xl mx-auto px-6 py-8 transition-all duration-600 ease-out ${fc}`}>
        {/* Header row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Environmental Conditions</h1>
            <p className="text-slate-400 text-sm">Real-time sensor readings · {region.name}</p>
          </div>

          {/* Region Selector */}
          <div className="relative">
            <button
              onClick={() => setDropOpen((v) => !v)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0d1f3a] border border-blue-500/30 hover:border-blue-500/60 transition-colors"
            >
              <span className="text-lg">📍</span>
              <div className="text-left">
                <div className="text-[10px] text-slate-500">Selected Region</div>
                <div className="text-sm font-semibold text-blue-300">{region.name}</div>
              </div>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl bg-[#0b1a2e] border border-white/10 shadow-2xl shadow-black/60 overflow-hidden flex flex-col" style={{ maxHeight: 420 }}>
                <div className="px-4 pt-3 pb-2 border-b border-white/6 shrink-0">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Select Monitoring Region</div>
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/8">
                    <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search region or state…"
                      className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {(() => {
                    const filtered = regions
                      .map((r, i) => ({ r, i }))
                      .filter(({ r }) =>
                        r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.state.toLowerCase().includes(search.toLowerCase()) ||
                        r.district.toLowerCase().includes(search.toLowerCase())
                      );
                    if (filtered.length === 0) return (
                      <div className="px-4 py-6 text-center text-xs text-slate-600">No regions found</div>
                    );
                    const grouped: Record<string, typeof filtered> = {};
                    filtered.forEach((item) => {
                      if (!grouped[item.r.state]) grouped[item.r.state] = [];
                      grouped[item.r.state].push(item);
                    });
                    return Object.entries(grouped).map(([state, items]) => (
                      <div key={state}>
                        <div className="px-4 py-1.5 text-[10px] text-slate-600 uppercase tracking-widest bg-white/2 border-b border-white/4 font-semibold">
                          {state}
                        </div>
                        {items.map(({ r, i }) => (
                          <button
                            key={i}
                            onClick={() => { setRegionIdx(i); setDropOpen(false); setSearch(""); }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-500/8 transition-colors text-left border-b border-white/3 ${i === regionIdx ? "bg-blue-500/12" : ""}`}
                          >
                            <div>
                              <div className="text-sm font-medium text-white flex items-center gap-2">
                                {r.name}
                                {i === regionIdx && (
                                  <span className="text-[10px] text-blue-400 font-normal">● active</span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">{r.district} · Elev. {r.elevation} m</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
                <div className="px-4 py-2 border-t border-white/6 text-[10px] text-slate-600 shrink-0">
                  {regions.length} hilly regions across India
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status strip */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "System Status", value: "MONITORING", color: "text-blue-400", dot: "bg-blue-400" },
            { label: "Data Sources", value: "8 Active", color: "text-green-400", dot: "bg-green-400" },
            { label: "Last Updated", value: "Just now", color: "text-blue-400", dot: "bg-blue-400" },
            { label: "Prediction Model", value: "ML v2.4", color: "text-purple-400", dot: "bg-purple-400" },
          ].map(({ label, value, color, dot }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0d1f3a] border border-white/6">
              <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
                <div className={`text-sm font-bold ${color}`}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sensor cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {region.data.map((d, i) => (
            <div
              key={d.label}
              className={`rounded-xl border p-4 transition-all duration-500 ${levelColor(d.level)}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{d.icon}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  d.level === "high" ? "bg-red-500/20 text-red-400" :
                  d.level === "moderate" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {d.level}
                </span>
              </div>
              <div className="text-3xl font-black text-white leading-none mb-1">
                {d.value}
                <span className="text-sm font-normal text-slate-400 ml-1">{d.unit}</span>
              </div>
              <div className="text-xs text-slate-400">{d.label}</div>
              <div className="mt-3 h-1 rounded-full bg-white/8 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    d.level === "high" ? "bg-red-500" :
                    d.level === "moderate" ? "bg-yellow-400" :
                    "bg-blue-400"
                  }`}
                  style={{ width: `${Math.min(100, (parseFloat(d.value) / (d.unit === "m" && parseFloat(d.value) < 10 ? 10 : parseFloat(d.value) > 100 ? parseFloat(d.value) * 1.2 : 100)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Chart + risk factors */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="col-span-2 rounded-xl bg-[#0d1f3a] border border-white/6 p-5">
            <RainfallChart region={region} />
          </div>
          <div className="rounded-xl bg-[#0d1f3a] border border-white/6 p-5 flex flex-col justify-between">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-4">Risk Factors</div>
            {[
              { label: "Rainfall", pct: Math.min(99, Math.round(parseFloat(region.data[0].value) / 2.2)), color: "bg-red-500" },
              { label: "Soil Saturation", pct: parseInt(region.data[4].value), color: "bg-orange-500" },
              { label: "River Level", pct: Math.min(99, Math.round(parseFloat(region.data[7].value) * 14)), color: "bg-yellow-400" },
              { label: "Slope Risk", pct: Math.min(99, Math.round(parseFloat(region.data[6].value) * 2.2)), color: "bg-blue-400" },
            ].map(({ label, pct, color }) => (
              <div key={label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-mono">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predict button */}
        <div className="flex justify-center">
          <button
            onClick={onPredict}
            className="group px-14 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-lg rounded-xl transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-100"
          >
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.977 3.977 0 0112 16a3.977 3.977 0 01-2.829-1.17l-.347-.346z" />
              </svg>
              PREDICT FLOOD RISK
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Analysis ────────────────────────────────────────────────────────
function AnalysisScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const fc = useFadeIn(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= analysisSteps.length) {
          clearInterval(interval);
          return s;
        }
        return s + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = (step / analysisSteps.length) * 100;
    const t = setTimeout(() => setProgress(target), 50);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step >= analysisSteps.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <div className="min-h-screen bg-[#070f1e] flex items-center justify-center">
      <div className={`w-full max-w-lg px-8 text-center transition-all duration-700 ${fc}`}>
        {/* Animated ring */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#1e3a5f" strokeWidth="8" />
            <circle
              cx="64" cy="64" r="56"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{Math.round(progress)}%</span>
          </div>
        </div>

        <h1 className="text-xl font-black text-white mb-2 tracking-wide">
          ANALYZING ENVIRONMENTAL CONDITIONS
        </h1>
        <p className="text-slate-500 text-sm mb-10">Running multi-parameter flood risk model…</p>

        <div className="space-y-3 text-left">
          {analysisSteps.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-400 ${
                i < step
                  ? "bg-green-500/10 border-green-500/25 text-green-300"
                  : i === step
                  ? "bg-blue-500/10 border-blue-500/25 text-blue-300 animate-pulse"
                  : "bg-white/3 border-white/6 text-slate-600"
              }`}
            >
              {i < step ? (
                <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : i === step ? (
                <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className="text-sm font-medium">✓ {s}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 h-1.5 rounded-full bg-white/6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
            style={{ width: `${progress}%`, transition: "width 0.5s ease-out" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Result ─────────────────────────────────────────────────────────
function ResultScreen({ onViewMap, regionIdx }: { onViewMap: () => void; regionIdx: number }) {
  const fc = useFadeIn(true);
  const [scaled, setScaled] = useState(false);
  useEffect(() => { setTimeout(() => setScaled(true), 300); }, []);
  const region = regions[regionIdx];
  const result = region.result;

  const recMap: Record<string, string[]> = {
    HIGH: [
      "Immediately alert all district emergency teams and NDRF units",
      "Issue mandatory evacuation orders for communities near river channels",
      "Deploy rescue boats and helicopter teams to high-risk zones",
      "Activate emergency shelters and relief camps",
    ],
    MODERATE: [
      "Alert district emergency teams and local authorities",
      "Issue advisory to communities near river channels",
      "Increase monitoring frequency to every 15 minutes",
      "Pre-position rescue teams at identified high-risk zones",
    ],
    LOW: [
      "Continue routine monitoring of all parameters",
      "Ensure emergency contacts are informed and on standby",
      "Check river embankments and drainage systems",
      "Keep community alert systems ready for activation",
    ],
  };

  return (
    <div className="min-h-screen bg-[#070f1e] text-white">
      <div className="border-b border-white/8 bg-[#0a1628]/80 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-bold">FFPS · Prediction Result · {region.name}</span>
        <span className="text-xs font-mono text-blue-400">SIH26192</span>
      </div>
      <div className={`max-w-5xl mx-auto px-6 py-10 transition-all duration-700 ${fc}`}>
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">Model Output · Confidence: 87%</div>
          <h1 className="text-3xl font-black text-white">PREDICTION RESULT</h1>
        </div>

        {/* Main result card */}
        <div className={`relative rounded-2xl border-2 ${region.resultBorder} bg-gradient-to-br ${region.resultBg} to-[#0d1f3a] p-10 mb-8 text-center transition-all duration-700 ${
          scaled ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border ${region.resultBorder} mb-6`}>
            <span className={`w-2.5 h-2.5 rounded-full ${result === "HIGH" ? "bg-red-400" : result === "MODERATE" ? "bg-yellow-400" : "bg-green-400"}`} />
            <span className={`${region.resultColor} text-xs font-mono tracking-widest`}>{result} RISK DETECTED</span>
          </div>
          <div className={`text-6xl font-black mb-2 ${region.resultColor}`}>{result}</div>
          <div className="text-slate-400 text-lg mb-6">Predicted Risk Level: {result.charAt(0) + result.slice(1).toLowerCase()}</div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {["LOW", "MODERATE", "HIGH"].map((r) => (
                <div
                  key={r}
                  className={`px-5 py-2 rounded-lg text-xs font-black tracking-wider transition-all ${
                    r === result
                      ? r === "HIGH" ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30"
                        : r === "MODERATE" ? "bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/30"
                        : "bg-green-500 text-white scale-110 shadow-lg shadow-green-500/30"
                      : "bg-white/8 text-slate-600"
                  }`}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {result === "HIGH"
              ? "Critical flood risk detected. Immediate evacuation measures should be initiated."
              : result === "MODERATE"
              ? "Moderate flood risk predicted. Authorities should remain on standby and monitor conditions closely."
              : "Low flood risk detected. Routine monitoring is sufficient at this time."}
          </p>
        </div>

        {/* Parameter grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {region.data.map((d) => (
            <div key={d.label} className="rounded-xl bg-[#0d1f3a] border border-white/6 p-4">
              <div className="text-xs text-slate-500 mb-1">{d.label}</div>
              <div className="text-lg font-black text-white">{d.value}<span className="text-xs text-slate-500 ml-1">{d.unit}</span></div>
              <div className={`mt-1 text-[10px] font-bold uppercase ${
                d.level === "high" ? "text-red-400" : d.level === "moderate" ? "text-yellow-400" : "text-blue-400"
              }`}>{d.level}</div>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className={`rounded-xl border p-5 mb-8 ${
          result === "HIGH" ? "bg-red-500/8 border-red-500/20" :
          result === "MODERATE" ? "bg-yellow-500/8 border-yellow-500/20" :
          "bg-green-500/8 border-green-500/20"
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{result === "HIGH" ? "🚨" : result === "MODERATE" ? "⚠️" : "✅"}</span>
            <div>
              <div className={`font-bold text-sm mb-1 ${result === "HIGH" ? "text-red-300" : result === "MODERATE" ? "text-yellow-300" : "text-green-300"}`}>
                Recommended Actions
              </div>
              <ul className="text-slate-400 text-sm space-y-1">
                {(recMap[result] || recMap["MODERATE"]).map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onViewMap}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-base rounded-xl transition-all duration-200 shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-100"
          >
            VIEW RISK MAP →
          </button>
        </div>
      </div>
    </div>
  );
}

// Leaflet map re-center helper
function MapFlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], zoom, { duration: 1.2 }); }, [lat, lng, zoom]);
  return null;
}

// ─── Screen 5: Map ────────────────────────────────────────────────────────────
function MapScreen({ onContinue, regionIdx }: { onContinue: () => void; regionIdx: number }) {
  const fc = useFadeIn(true);
  const region = regions[regionIdx];
  const zones = region.zones;

  const counts = {
    high: zones.filter((z) => z.risk === "high").length,
    moderate: zones.filter((z) => z.risk === "moderate").length,
    low: zones.filter((z) => z.risk === "low").length,
  };

  const zoneColor = (r: string) =>
    r === "high" ? "#ef4444" : r === "moderate" ? "#eab308" : "#22c55e";

  return (
    <div className="min-h-screen bg-[#070f1e] text-white flex flex-col">
      <div className="border-b border-white/8 bg-[#0a1628]/80 px-6 py-3 flex items-center justify-between shrink-0">
        <span className="text-sm font-bold">FFPS · Satellite Risk Map · {region.name}</span>
        <span className="text-xs font-mono text-blue-400">SIH26192 · Live Satellite View</span>
      </div>

      <div className={`flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 py-6 gap-6 transition-all duration-700 ${fc}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Hyper-Local Flood Risk Assessment</h1>
            <p className="text-slate-500 text-sm">Satellite imagery · ESRI World Imagery · Risk zones shown as prototype overlay</p>
          </div>
          <button
            onClick={onContinue}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-red-500/30 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
            Continue to Warning →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 flex-1">
          {/* Leaflet satellite map */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ minHeight: 500 }}>
            <MapContainer
              center={[region.lat, region.lng]}
              zoom={region.zoom}
              style={{ width: "100%", height: "100%", minHeight: 500 }}
              zoomControl={true}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
                maxZoom={18}
              />
              <MapFlyTo lat={region.lat} lng={region.lng} zoom={region.zoom} />
              {zones.map((z, i) => (
                <Circle
                  key={i}
                  center={[z.lat, z.lng]}
                  radius={z.radiusKm * 1000}
                  pathOptions={{
                    color: zoneColor(z.risk),
                    fillColor: zoneColor(z.risk),
                    fillOpacity: 0.18,
                    weight: 2,
                    opacity: 0.85,
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{z.name}</div>
                      <div style={{ color: zoneColor(z.risk), fontWeight: 700, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>
                        {z.risk} risk
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Population at risk: {z.pop}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Zone radius: {z.radiusKm} km</div>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </div>

          {/* Side panel */}
          <div className="space-y-4 flex flex-col">
            <div className="rounded-xl bg-[#0d1f3a] border border-white/6 p-5">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-4">Risk Analysis · {region.name}</div>
              <div className="space-y-3">
                {[
                  { risk: "high", label: "High Risk Zones", count: counts.high, dot: "bg-red-500", border: "border-red-500/20", bg: "bg-red-500/10", tc: "text-red-400", lc: "text-red-300" },
                  { risk: "moderate", label: "Moderate Risk", count: counts.moderate, dot: "bg-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/10", tc: "text-yellow-400", lc: "text-yellow-300" },
                  { risk: "low", label: "Low Risk Zones", count: counts.low, dot: "bg-green-500", border: "border-green-500/20", bg: "bg-green-500/10", tc: "text-green-400", lc: "text-green-300" },
                ].map(({ label, count, dot, border, bg, tc, lc }) => (
                  <div key={label} className={`flex items-center justify-between p-3 rounded-lg ${bg} border ${border}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                      <span className={`text-sm font-medium ${lc}`}>{label}</span>
                    </div>
                    <span className={`font-black text-lg ${tc}`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#0d1f3a] border border-white/6 p-5 flex-1">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Zone Details (click on map for info)</div>
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 300 }}>
                {zones.map((z, i) => (
                  <div key={i} className={`rounded-lg border px-3 py-2.5 ${
                    z.risk === "high" ? "bg-red-500/8 border-red-500/20" :
                    z.risk === "moderate" ? "bg-yellow-500/8 border-yellow-500/20" :
                    "bg-green-500/8 border-green-500/20"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{z.name}</span>
                      <span className={`text-[10px] font-black uppercase ${
                        z.risk === "high" ? "text-red-400" : z.risk === "moderate" ? "text-yellow-400" : "text-green-400"
                      }`}>{z.risk}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Pop: {z.pop}</span>
                      <span>Radius: {z.radiusKm} km</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#0d1f3a] border border-white/6 p-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Map Legend</div>
              {[
                { color: "bg-green-500", ring: "ring-green-500/30", label: "Low Risk Zone" },
                { color: "bg-yellow-400", ring: "ring-yellow-400/30", label: "Moderate Risk Zone" },
                { color: "bg-red-500", ring: "ring-red-500/30", label: "High Risk Zone" },
              ].map(({ color, ring, label }) => (
                <div key={label} className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-full ${color} bg-opacity-30 ring-2 ${ring}`} />
                  <span className="text-xs text-slate-300">{label} (radius shown to scale)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 6: Warning ────────────────────────────────────────────────────────
function WarningScreen({ onFinish }: { onFinish: () => void }) {
  const fc = useFadeIn(true);
  return (
    <div className="min-h-screen bg-[#0f0500] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Pulsing red glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)", animation: "pulse 2s ease-in-out infinite" }}
        />
      </div>
      {/* Stripe pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 0, transparent 50%)",
          backgroundSize: "12px 12px",
        }}
      />

      <div className={`relative z-10 text-center px-8 max-w-2xl transition-all duration-700 ${fc}`}>
        {/* Warning icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
            <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-[#0f0500]" style={{ animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite" }} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-400" style={{ animation: "pulse 1s ease-in-out infinite" }} />
          <span className="text-red-300 text-xs font-mono tracking-widest uppercase">EARLY WARNING SYSTEM ACTIVATED</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-1">EARLY WARNING</h1>
        <h2 className="text-2xl font-black text-red-400 mb-6 tracking-wide">FLASH FLOOD RISK ALERT</h2>

        <div className="rounded-2xl bg-red-500/10 border-2 border-red-500/40 p-8 mb-8">
          <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Risk Level</div>
          <div className="text-7xl font-black text-red-400 mb-4" style={{ textShadow: "0 0 40px rgba(239,68,68,0.5)" }}>HIGH</div>
          <p className="text-slate-300 text-base leading-relaxed">
            High flood risk detected. Take precautionary measures and prepare for possible evacuation.
            All emergency protocols should be initiated immediately.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "🚨", label: "Alert Issued", sub: "All districts notified" },
            { icon: "🚁", label: "Teams Ready", sub: "Rescue on standby" },
            { icon: "📻", label: "Broadcast Live", sub: "Emergency channels" },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="rounded-xl bg-white/4 border border-white/8 p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm font-bold text-white">{label}</div>
              <div className="text-[11px] text-slate-500">{sub}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onFinish}
          className="px-10 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105"
        >
          VIEW SYSTEM SUMMARY →
        </button>
      </div>
    </div>
  );
}

// ─── Screen 7: Final ──────────────────────────────────────────────────────────
function FinalScreen({ onRestart }: { onRestart: () => void }) {
  const fc = useFadeIn(true);
  return (
    <div className="min-h-screen bg-[#070f1e] flex flex-col items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />

      <div className={`relative z-10 text-center px-8 max-w-3xl transition-all duration-700 ${fc}`}>
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black text-white mx-auto mb-8 shadow-2xl shadow-blue-500/30">
          FF
        </div>

        <div className="text-xs font-mono tracking-widest text-blue-400 mb-4 uppercase">
          SIH26192 · Smart India Hackathon 2026
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Flash Flood Prediction System<br />
          <span className="text-blue-400">for Hilly Regions</span>
        </h1>

        <p className="text-2xl text-slate-400 font-light mb-4 italic">
          "Predict · Monitor · Warn · Protect"
        </p>

        <p className="text-slate-500 text-base mb-12 max-w-xl mx-auto leading-relaxed">
          Turning environmental data into timely disaster warnings —
          protecting vulnerable communities through real-time multi-source data fusion and AI-powered prediction.
        </p>

        {/* Pipeline */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
          {["Satellite Data", "IoT Sensors", "Weather API", "Terrain Data"].map((src, i, arr) => (
            <div key={src} className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-lg bg-[#0d1f3a] border border-blue-500/20 text-sm text-blue-300">
                {src}
              </div>
              {i < arr.length - 1 && <span className="text-slate-600">→</span>}
            </div>
          ))}
          <span className="text-slate-600 mx-2">→</span>
          <div className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold">ML Engine</div>
          <span className="text-slate-600 mx-2">→</span>
          <div className="px-4 py-2 rounded-lg bg-red-600/80 text-white text-sm font-bold">⚠ Early Warning</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { val: "8+", label: "Parameters Monitored" },
            { val: "< 5s", label: "Prediction Latency" },
            { val: "87%", label: "Model Confidence" },
            { val: "24/7", label: "Continuous Monitoring" },
          ].map(({ val, label }) => (
            <div key={label} className="rounded-xl bg-[#0d1f3a] border border-white/6 py-4 px-3">
              <div className="text-2xl font-black text-blue-400 mb-1">{val}</div>
              <div className="text-[11px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-xl shadow-blue-500/25"
          >
            ↩ Restart Demo
          </button>
          <div className="px-8 py-3.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-sm flex items-center">
            Prototype Demonstration · Not production deployment
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [regionIdx, setRegionIdx] = useState(1);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {screen === "intro" && <IntroScreen onEnter={() => setScreen("dashboard")} />}
      {screen === "dashboard" && (
        <DashboardScreen
          onPredict={() => setScreen("analysis")}
          regionIdx={regionIdx}
          setRegionIdx={setRegionIdx}
        />
      )}
      {screen === "analysis" && <AnalysisScreen onDone={() => setScreen("result")} />}
      {screen === "result" && <ResultScreen onViewMap={() => setScreen("map")} regionIdx={regionIdx} />}
      {screen === "map" && <MapScreen onContinue={() => setScreen("warning")} regionIdx={regionIdx} />}
      {screen === "warning" && <WarningScreen onFinish={() => setScreen("final")} />}
      {screen === "final" && <FinalScreen onRestart={() => setScreen("intro")} />}
    </div>
  );
}
