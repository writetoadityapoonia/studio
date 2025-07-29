type MapDisplayProps = {
  coordinates: {
    lat: number;
    lng: number;
  };
};

export function MapDisplay({ coordinates }: MapDisplayProps) {
  const embedUrl = `https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${coordinates.lat},${coordinates.lng}&zoom=15`;

  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={embedUrl}
      title="Property Location"
    ></iframe>
  );
}
