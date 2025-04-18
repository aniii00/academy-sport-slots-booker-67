
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Trainease</h3>
            <p className="text-gray-600 mb-4">
              Train like a beast, book like a breeze.
              India's dopest sports zones are just a tap away — grab your slot and let the grind begin. 🏸🔥
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-sports-blue">Home</Link>
              </li>
              <li>
                <Link to="/centers" className="text-gray-600 hover:text-sports-blue">Find Centers</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-sports-blue">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-sports-blue">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-600">
              <p>Email: info@trainease.com</p>
              <p>Phone: +91 98765 43210</p>
              <p>
                Head Office: Trainease, <br />
                24, Hill Road, Bandra West, <br />
                Mumbai - 400050
              </p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Trainease. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
