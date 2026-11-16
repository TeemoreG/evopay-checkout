import { useEffect, useRef, useState } from 'react';

export default function GoogleAddressInput({ onAddressSelect, placeholder = "Search for a place, building, or address..." }) {
    const containerRef = useRef(null);
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
        if (!isLoaded || !containerRef.current) return;

        // Initialize the new PlaceAutocompleteElement
        const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
            componentRestrictions: { country: 'ke' },
            // Add this to force the component to use a light theme
            requestedRegion: 'KE', 
        });

        placeAutocomplete.classList.add('w-full', 'custom-google-autocomplete');
        
        placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ['formattedAddress', 'location', 'id', 'displayName'] });

            if (place.location) {
                onAddressSelect({
                    formatted: place.formattedAddress || place.displayName,
                    lat: place.location.lat(),
                    lng: place.location.lng(),
                    placeId: place.id,
                });
            }
        });

        containerRef.current.appendChild(placeAutocomplete);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [isLoaded, onAddressSelect]);

    return (
        <div className="w-full">
            {/* 
              This style tag overrides Google's default dark mode inside the web component.
              It forces the background to match your brand-input color.
            */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-google-autocomplete {
                    color-scheme: light !important;
                }
                .custom-google-autocomplete::part(input) {
                    background-color: #E8EDF2 !important; 
                    color: #1A1A1A !important;
                    border: 1px solid transparent !important;
                    border-radius: 0.5rem !important;
                    padding: 12px 16px !important;
                    font-size: 14px !important;
                    box-shadow: none !important;
                }
                .custom-google-autocomplete::part(input):focus {
                    background-color: #ffffff !important;
                    border-color: transparent !important;
                    outline: 2px solid rgba(224, 90, 38, 0.3) !important;
                }
            `}} />

            {!isLoaded ? (
                <div className="w-full h-12 bg-brand-input rounded-lg animate-pulse flex items-center px-4">
                    <span className="text-sm text-gray-400">Loading Google Maps...</span>
                </div>
            ) : (
                <div ref={containerRef} className="w-full"></div>
            )}
            <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <p className="text-[11px] text-gray-500">Search for any building, mall, institution, or address</p>
            </div>
        </div>
    );
}