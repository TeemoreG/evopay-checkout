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

        const placeAutocomplete = new window.google.maps.places.PlaceAutocompleteElement({
            componentRestrictions: { country: 'ke' },
        });

        placeAutocomplete.classList.add('custom-google-autocomplete');
        
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
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [isLoaded, onAddressSelect]);

    return (
        <div className="w-full">
            <style dangerouslySetInnerHTML={{__html: `
                /* Force light mode on the custom Google element */
                gmp-place-autocomplete.custom-google-autocomplete {
                    color-scheme: light !important;
                    --gmp-color-surface: #E8EDF2 !important;
                    --gmp-color-on-surface: #1A1A1A !important;
                    --gmp-color-outline: transparent !important;
                }
                gmp-place-autocomplete.custom-google-autocomplete input {
                    background-color: #E8EDF2 !important;
                    color: #1A1A1A !important;
                    border: 1px solid transparent !important;
                    border-radius: 0.5rem !important;
                    padding: 14px 16px 14px 40px !important;
                    font-size: 14px !important;
                    width: 100% !important;
                }
                gmp-place-autocomplete.custom-google-autocomplete input:focus {
                    background-color: #ffffff !important;
                    border-color: transparent !important;
                    outline: 2px solid rgba(224, 90, 38, 0.3) !important;
                }
            `}} />

            {!isLoaded ? (
                <div className="w-full h-[52px] bg-[#E8EDF2] rounded-lg animate-pulse flex items-center px-4">
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