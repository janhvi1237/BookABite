import React, { useState } from 'react';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineChatAlt,
  HiOutlinePaperAirplane,
} from 'react-icons/hi';
import FoodMascot from '../../components/mascot/FoodMascot';
import { useMascot } from '../../context/MascotContext';
import { useToast } from '../../components/common/Toast';
import './ContactPage.css';

export default function ContactPage() {
  const { triggerReaction } = useMascot();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setName('');
      setEmail('');
      setMessage('');
      triggerReaction('celebrating', 'Message received! Our team will respond shortly.', 4000);
      showToast('Thank you! Your message has been sent.', 'success');
    }, 800);
  };

  return (
    <div className="bab-contact-page">
      <div className="bab-contact-container">
        {/* Header */}
        <div className="bab-contact-header">
          <h1>We’d Love to Hear From You</h1>
          <p>
            Whether you have questions about booking a table, partnering your café, or simply sharing food recommendations, our concierge team is always here for you.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="bab-contact-grid">
          {/* Info Card */}
          <div className="bab-contact-info-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <FoodMascot mood="serving" size={70} />
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', margin: '0 0 4px' }}>
                  At Your Service
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Need instant reservation support or restaurant inquiries?
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

            <div className="bab-contact-method">
              <div className="bab-contact-method__icon">
                <HiOutlineMail size={22} />
              </div>
              <div>
                <h4>Email Support</h4>
                <p>
                  Diners: <a href="mailto:support@bookabite.com">support@bookabite.com</a>
                </p>
                <p>
                  Restaurant Partners: <a href="mailto:partners@bookabite.com">partners@bookabite.com</a>
                </p>
              </div>
            </div>

            <div className="bab-contact-method">
              <div className="bab-contact-method__icon">
                <HiOutlinePhone size={22} />
              </div>
              <div>
                <h4>Customer Helpline</h4>
                <p>
                  <a href="tel:+912041232483">+91 (020) 4123-BITE</a>
                </p>
                <p>Toll-free customer care available 7 days a week</p>
              </div>
            </div>

            <div className="bab-contact-method">
              <div className="bab-contact-method__icon">
                <HiOutlineClock size={22} />
              </div>
              <div>
                <h4>Concierge Hours</h4>
                <p>Monday – Sunday: 9:00 AM – 11:00 PM IST</p>
              </div>
            </div>

            <div className="bab-contact-method">
              <div className="bab-contact-method__icon">
                <HiOutlineLocationMarker size={22} />
              </div>
              <div>
                <h4>Culinary Headquarters</h4>
                <p>BookABite Media & Tech Labs</p>
                <p>Lane 7, Koregaon Park, Pune, Maharashtra 411001</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bab-contact-form-card">
            <h3>Send Us a Message</h3>
            <p>Fill out the form below and our support team will get back to you within 2 hours.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="bab-form-label">Your Name *</label>
                <input
                  type="text"
                  className="bab-form-input"
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="bab-form-label">Email Address *</label>
                <input
                  type="email"
                  className="bab-form-input"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="bab-form-label">Topic / Subject</label>
                <select
                  className="bab-form-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="General Inquiry">General Question</option>
                  <option value="Restaurant Partnership">Register / Partner My Restaurant</option>
                  <option value="Table Reservation Help">Table Reservation Help</option>
                  <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                </select>
              </div>

              <div>
                <label className="bab-form-label">Message *</label>
                <textarea
                  className="bab-form-textarea"
                  rows={4}
                  placeholder="How can we assist your dining or restaurant experience?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="bab-btn bab-btn--secondary"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <HiOutlinePaperAirplane size={18} style={{ transform: 'rotate(45deg)' }} />
                {submitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
