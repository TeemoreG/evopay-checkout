import { useEffect, useRef, useState } from 'react';

export default function GoogleAddressInput({ onAddressSelect, placeholder = "Start typing your address..." }) {
    const inputRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check if Google Maps script is already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true);
            return;
        }

        // Otherwise, wait for it to load
        const interval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsLoaded(true);
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isLoaded || !inputRef.current) return;

        // Initialize Google Autocomplete
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'ke' }, // Restrict to Kenya
            fields: ['formatted_address', 'geometry', 'place_id', 'address_components'],
            types: ['address']
        });

        // Listen for user selection
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry || !place.geometry.location) {
                alert("No location details available for this address.");
                return;
            }

            // Send the data back to the Checkout page
            onAddressSelect({
                formatted: place.formatted_address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                placeId: place.place_id,
                components: place.address_components,
            });
        });
    }, [isLoaded, onAddressSelect]);

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="text"
                placeholder={isLoaded ? placeholder : "Loading Google Maps..."}
                disabled={!isLoaded}
                className="w-full rounded-lg bg-brand-input border border-transparent px-4 py-3 text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
            />
            <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <p className="text-[11px] text-gray-500">Powered by Google · Select a valid address for delivery</p>
            </div>
        </div>
    );
}