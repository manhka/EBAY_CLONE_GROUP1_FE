import React from 'react';
import { FaFacebookF } from 'react-icons/fa';
import { RiTwitterXFill } from "react-icons/ri"; // Icon cho X (Twitter)

// 1. Tách dữ liệu ra để dễ quản lý và chỉnh sửa
const footerData = [
  {
    title: 'Buy',
    links: [
      { name: 'Registration', path: '/register' },
      { name: 'Bidding & buying help', path: '/help/buy' },
      { name: 'Stores', path: '/stores' },
      { name: 'Creator Collections', path: '/collections' },
      { name: 'eBay for Charity', path: '/charity' },
      { name: 'Charity Shop', path: '/charity-shop' },
      { name: 'Seasonal Sales and events', path: '/seasonal-sales' },
      { name: 'eBay Gift Cards', path: '/gift-cards' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { name: 'Start selling', path: '/sell' },
      { name: 'How to sell', path: '/help/sell' },
      { name: 'Business sellers', path: '/business' },
      { name: 'Affiliates', path: '/affiliates' },
    ],
    // Thêm một nhóm con trong cùng một cột
    subSections: [
      {
        title: 'Tools & apps',
        links: [
          { name: 'Developers', path: '/developers' },
          { name: 'Security center', path: '/security-center' },
          { name: 'Site map', path: '/sitemap' },
        ],
      },
    ],
  },
  {
    title: 'eBay companies',
    links: [
        { name: 'TCGplayer', path: '/tcgplayer' }
    ],
    subSections: [
        {
            title: 'Stay connected',
            isSocial: true,
            links: [
                { name: 'Facebook', path: 'https://facebook.com/ebay', icon: <FaFacebookF /> },
                { name: 'X (Twitter)', path: 'https://twitter.com/ebay', icon: <RiTwitterXFill /> },
            ]
        }
    ]
  },
  {
    title: 'About eBay',
    links: [
      { name: 'Company info', path: '/company-info' },
      { name: 'News', path: '/news' },
      { name: 'Deferred Prosecution Agreement with District of Massachusetts', path: '/dpa' },
      { name: 'Investors', path: '/investors' },
      { name: 'Careers', path: '/careers' },
      { name: 'Diversity & inclusion', path: '/diversity' },
      { name: 'Global Impact', path: '/global-impact' },
      { name: 'Government relations', path: '/government-relations' },
      { name: 'Advertise with us', path: '/advertise' },
      { name: 'Policies', path: '/policies' },
      { name: 'Verified Rights Owner (VeRO) Program', path: '/vero-program' },
      { name: 'eCI Licenses', path: '/licenses' },
    ],
  },
  {
    title: 'Help & Contact',
    links: [
      { name: 'Seller Center', path: '/seller-center' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'eBay Returns', path: '/returns' },
      { name: 'eBay Money Back Guarantee', path: '/money-back-guarantee' },
    ],
    subSections: [
        {
            title: 'Community',
            links: [
                { name: 'Announcements', path: '/announcements' },
                { name: 'eBay Community', path: '/community' },
                { name: 'eBay for Business Podcast', path: '/podcast' },
            ]
        },
        {
            title: 'eBay sites',
            isSiteSelector: true,
        }
    ]
  },
];

const legalLinks = [
    { name: 'Accessibility', path: '/accessibility' },
    { name: 'User Agreement', path: '/user-agreement' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'Consumer Health Data', path: '/health-data' },
    { name: 'Payments Terms of Use', path: '/payments-terms' },
    { name: 'Cookies', path: '/cookies' },
    { name: 'CA Privacy Notice', path: '/ca-privacy' },
    { name: 'Your Privacy Choices', path: '/privacy-choices', isIcon: true },
    { name: 'and AdChoice', path: '/adchoice', isIcon: true },
]

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-gray-300">
      <div className="max-w-[100%] mx-auto py-10 px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {footerData.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-sm mb-2">{section.title}</h3>
              <ul>
                {section.links.map((link) => (
                  <li key={link.name} className="py-1">
                    <a href={link.path} className="text-xs text-gray-600 hover:underline flex items-center gap-2">
                      {link.icon} {link.name}
                    </a>
                  </li>
                ))}
              </ul>
              {section.subSections?.map(subSection => (
                <div key={subSection.title} className="mt-6">
                    <h3 className="font-bold text-sm mb-2">{subSection.title}</h3>
                    {subSection.isSiteSelector ? (
                        <button className="flex items-center gap-2 border border-gray-400 rounded px-2 py-1 text-xs">
                            <img src="https://flagcdn.com/us.svg" width="20" alt="US Flag" /> United States
                        </button>
                    ) : (
                        <ul>
                            {subSection.links.map((link) => (
                                <li key={link.name} className="py-1">
                                    <a href={link.path} className="text-xs text-gray-600 hover:underline flex items-center gap-2">
                                        {link.icon} {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-gray-300 py-4">
        <div className="max-w-[100%] mx-auto px-4 text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Copyright © 1995-2025 eBay Inc. All Rights Reserved.</span>
            <nav className="flex flex-wrap items-center gap-x-4">
                {legalLinks.map(link => (
                    <a key={link.name} href={link.path} className="hover:underline">
                        {link.name}
                    </a>
                ))}
            </nav>
        </div>
      </div>
    </footer>
  );
}