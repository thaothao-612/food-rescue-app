"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

// Sửa lỗi hiển thị icon Marker trong Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Icon tùy chỉnh cho người dùng
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface StoreMarker {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  deal_count: number;
  has_flash_sale: boolean;
}

interface MapViewProps {
  stores: StoreMarker[];
  userCoords: [number, number] | null;
}

const defaultCenter: [number, number] = [10.776, 106.7]; // HCM

// Component để tự động cập nhật tâm bản đồ
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapView({ stores, userCoords }: MapViewProps) {
  const [center, setCenter] = useState<[number, number]>(userCoords || defaultCenter);

  useEffect(() => {
    if (userCoords) {
      setCenter(userCoords);
    }
  }, [userCoords]);

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Vị trí của người dùng */}
      {userCoords && (
        <>
          <Marker position={userCoords} icon={userIcon}>
            <Popup>
              <div className="font-semibold text-orange-600 text-xs">Vị trí của bạn</div>
            </Popup>
          </Marker>
          <Circle
            center={userCoords}
            radius={2000}
            pathOptions={{ color: "#FF6B00", fillColor: "#FF6B00", fillOpacity: 0.05 }}
          />
        </>
      )}

      {stores.map((store) => {
        if (store.lat == null || store.lng == null) return null;
        const position: [number, number] = [store.lat, store.lng];

        return (
          <Marker key={store.id} position={position}>
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-gray-900">{store.name}</div>
                <div className="text-gray-600">
                  {store.deal_count} deal đang bán
                </div>
                {store.has_flash_sale && (
                  <div className="text-[11px] font-semibold text-red-500">
                    Có Flash Sale cuối ngày 🔥
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

