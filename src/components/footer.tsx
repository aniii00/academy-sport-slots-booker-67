import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="relative bg-cover bg-center" style={{ backgroundImage: "url('/https://gvrayvnoriflhjyauqrg.supabase.co/storage/v1/object/public/venue-images/47440edcda1755338e49b4c001259df8.jpg')" }}>
      <div className="backdrop-blur-md bg-black/60 rounded-2xl mx-4 my-8 p-6 md:p-12 text-white shadow-lg max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-4">Trainease</h3>
            <p className="text-gray-300">
              Train like a beast, book like a breeze. <br />
              India's dopest sports zones are just a tap away — grab your slot and let the grind begin. 🏸🔥
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/centers" className="hover:text-white transition">Find Centers</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300 space-y-2">
              <p className="flex items-center gap-2">
                <FaEnvelope /> info@trainease.com
              </p>
              <p className="flex items-center gap-2">
                <FaPhone /> +91 98765 43210
              </p>
              <p className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1" />
                Head Office: Trainease, <br />
                24, Hill Road, Bandra West, <br />
                Mumbai - 400050
              </p>
            </address>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Trainease. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
