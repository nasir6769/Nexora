import { useEffect, useState } from "react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

import "./MerchantProfile.css";

const STORAGE_KEY = "merchantProfile";

const emptyAddress = {
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function MerchantProfile() {
  const [address, setAddress] = useState(emptyAddress);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedProfile = localStorage.getItem(STORAGE_KEY);

    if (!storedProfile) {
      return;
    }

    try {
      const profile = JSON.parse(storedProfile);

      setAddress({
        ...emptyAddress,
        ...(profile?.address || {}),
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setAddress((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !address.addressLine1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      setError(
        "Please enter your address, city, state and pincode."
      );
      return;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    const profile = {
      address: {
        addressLine1: address.addressLine1.trim(),
        addressLine2: address.addressLine2.trim(),
        landmark: address.landmark.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      },
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(profile)
    );

    setAddress(profile.address);
    setSaved(true);
    setError("");
  };

    const handleClearAddress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAddress(emptyAddress);
    setSaved(false);
    setError("");
  };

  return (
    <div className="merchant-profile">
      <div className="page-header">
        <div>
          <h1>Merchant Profile</h1>
          <p>
            Save your business delivery address once and
            reuse it for future orders.
          </p>
        </div>
      </div>

      {saved && (
        <div className="merchant-profile-success">
          Address saved successfully.
        </div>
      )}

      {error && (
        <div className="merchant-profile-error">
          {error}
        </div>
      )}

      <Card padding="large">
        <div className="merchant-profile-section">
          <div className="merchant-profile-section-header">
            <div>
              <h2>Delivery Address</h2>
              <p>
                This address will be associated with your
                procurement orders.
              </p>
            </div>
          </div>

          <form
            className="merchant-profile-form"
            onSubmit={handleSubmit}
          >
            <div className="merchant-profile-field full-width">
              <label htmlFor="addressLine1">
                Address Line 1
              </label>

              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                value={address.addressLine1}
                onChange={handleChange}
                placeholder="Building, shop number, street"
                required
              />
            </div>

            <div className="merchant-profile-field full-width">
              <label htmlFor="addressLine2">
                Address Line 2
              </label>

              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                value={address.addressLine2}
                onChange={handleChange}
                placeholder="Area, locality"
              />
            </div>

            <div className="merchant-profile-field">
              <label htmlFor="landmark">
                Landmark
              </label>

              <input
                id="landmark"
                name="landmark"
                type="text"
                value={address.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark"
              />
            </div>

            <div className="merchant-profile-field">
              <label htmlFor="city">
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                value={address.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>

            <div className="merchant-profile-field">
              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                value={address.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>

            <div className="merchant-profile-field">
              <label htmlFor="pincode">
                Pincode
              </label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={address.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                required
              />
            </div>

           <div className="merchant-profile-form-footer">
  <p>
    You can update this address whenever your
    business location changes.
  </p>

  <div className="merchant-profile-form-actions">
    <Button
      type="button"
      variant="secondary"
      onClick={handleClearAddress}
    >
      Clear Address
    </Button>

    <Button type="submit">
      Save Address
    </Button>
  </div>
</div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default MerchantProfile;