import { useEffect, useRef, useState } from 'react';

export default function GoogleAddressInput({ onAddressSelect, placeholder = "Search for a place, building, or address..." }) {
    const inputRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true);
            return;
        }
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

        // Use the classic Autocomplete attached to a normal input
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'ke' },
            fields: ['formatted_address', 'geometry', 'place_id', 'name'],
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (place.geometry && place.geometry.location) {
                onAddressSelect({
                    formatted: place.formatted_address || place.name,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    placeId: place.place_id,
                });
            }
        });
    }, [isLoaded, onAddressSelect]);

    return (
        <div className="w-full relative">
            {!isLoaded ? (
                <div className="w-full h-[50px] bg-brand-input rounded-lg animate-pulse flex items-center px-4">
                    <span className="text-sm text-gray-500">Loading Google Maps...</span>
                </div>
            ) : (
                <>
                    {/* Search Icon inside the input */}
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    {/* Standard Tailwind Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        className="w-full rounded-lg bg-brand-input border border-transparent pl-10 pr-4 py-3.5 text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-brand-primary/25 transition-all"
                    />
                </>
            )}
        </div>
    );
}