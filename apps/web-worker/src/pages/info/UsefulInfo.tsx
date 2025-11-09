import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, AlertTriangle, Shield, HardHat, FileText, Phone,
  ChevronDown, ChevronUp, ExternalLink, Info, ArrowLeft
} from 'lucide-react'

interface InfoSection {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  content: {
    title: string
    description: string
    items?: string[]
    links?: { label: string; url: string }[]
  }[]
}

export default function UsefulInfo() {
  const navigate = useNavigate()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const infoSections: InfoSection[] = [
    {
      id: 'coshh',
      title: 'COSHH Information',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      content: [
        {
          title: 'What is COSHH?',
          description: 'Control of Substances Hazardous to Health (COSHH) regulations protect workers from health risks related to hazardous substances.',
          items: [
            'Always read product labels before use',
            'Use Personal Protective Equipment (PPE) as instructed',
            'Never mix cleaning products unless specified',
            'Ensure adequate ventilation when using chemicals',
            'Store chemicals in their original containers',
            'Keep chemicals away from food and drink'
          ]
        },
        {
          title: 'Common Hazardous Substances',
          description: 'Be aware of these common hazardous substances in cleaning:',
          items: [
            'Bleach and chlorine-based products',
            'Ammonia-based cleaners',
            'Acidic descalers and limescale removers',
            'Aerosol sprays',
            'Solvent-based products'
          ]
        },
        {
          title: 'Emergency Procedures',
          description: 'In case of chemical exposure:',
          items: [
            'Skin contact: Rinse immediately with plenty of water',
            'Eye contact: Rinse eyes for at least 15 minutes',
            'Inhalation: Move to fresh air immediately',
            'Ingestion: Do not induce vomiting - seek medical help',
            'Always report any exposure to your supervisor'
          ]
        }
      ]
    },
    {
      id: 'hse',
      title: 'Health & Safety Executive (HSE)',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      content: [
        {
          title: 'Your Rights at Work',
          description: 'The HSE ensures safe working conditions. You have the right to:',
          items: [
            'Work in a safe and healthy environment',
            'Receive proper health and safety training',
            'Use appropriate safety equipment',
            'Report unsafe conditions without fear',
            'Refuse work that puts you at serious risk',
            'Have regular rest breaks'
          ]
        },
        {
          title: 'Reporting Hazards',
          description: 'If you identify a hazard:',
          items: [
            'Report it to your supervisor immediately',
            'Use the maintenance issue reporting system',
            'Document with photos if possible',
            'Do not attempt to fix serious hazards yourself',
            'Follow up to ensure the hazard is addressed'
          ]
        },
        {
          title: 'HSE Resources',
          description: 'Additional information and support:',
          links: [
            { label: 'HSE Website', url: 'https://www.hse.gov.uk/' },
            { label: 'Report Safety Concerns', url: 'https://www.hse.gov.uk/contact/concerns.htm' },
            { label: 'Worker Rights', url: 'https://www.hse.gov.uk/workers/index.htm' }
          ]
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety at Work',
      icon: <HardHat className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      content: [
        {
          title: 'Personal Protective Equipment (PPE)',
          description: 'Essential PPE for cleaning and maintenance work:',
          items: [
            'Gloves: Protect hands from chemicals and cuts',
            'Safety goggles: Prevent eye injuries from splashes',
            'Non-slip footwear: Reduce risk of slips and falls',
            'Apron/protective clothing: Protect skin and clothing',
            'Face masks: Use when working with strong chemicals',
            'Knee pads: For jobs requiring kneeling'
          ]
        },
        {
          title: 'Manual Handling',
          description: 'Safe lifting and carrying techniques:',
          items: [
            'Assess the load before lifting',
            'Bend your knees, not your back',
            'Keep the load close to your body',
            'Use both hands and get a firm grip',
            'Turn with your feet, not your waist',
            'Ask for help with heavy or awkward items'
          ]
        },
        {
          title: 'Preventing Slips, Trips & Falls',
          description: 'The most common workplace accidents:',
          items: [
            'Use wet floor signs when mopping',
            'Clean up spills immediately',
            'Keep walkways clear of obstacles',
            'Use proper stepladders, never chairs',
            'Ensure good lighting in work areas',
            'Wear appropriate non-slip footwear'
          ]
        },
        {
          title: 'Working at Heights',
          description: 'When using ladders or stepladders:',
          items: [
            'Inspect equipment before use',
            'Ensure stable, level ground',
            'Maintain three points of contact',
            'Never overreach - move the ladder',
            'Face the ladder when climbing',
            'Never work at height if feeling unwell'
          ]
        }
      ]
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: <Phone className="w-6 h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      content: [
        {
          title: 'Emergency Services',
          description: 'In case of emergency:',
          items: [
            '999 - Police, Fire, Ambulance (UK)',
            '111 - NHS Non-Emergency Medical Advice (UK)',
            'Always call emergency services for serious incidents'
          ]
        },
        {
          title: 'Company Contacts',
          description: 'Internal emergency contacts:',
          items: [
            'Report all accidents and injuries to your supervisor',
            'Use the app to report maintenance issues',
            'Contact your manager for non-emergency safety concerns'
          ]
        },
        {
          title: 'First Aid',
          description: 'Basic first aid guidance:',
          items: [
            'Location of first aid kits should be known',
            'Report all injuries, no matter how minor',
            'Do not move seriously injured persons',
            'Call for professional help if unsure',
            'Complete accident report forms when required'
          ]
        }
      ]
    },
    {
      id: 'general',
      title: 'General Work Guidance',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      content: [
        {
          title: 'Professional Standards',
          description: 'Maintaining high standards:',
          items: [
            'Arrive on time for scheduled jobs',
            'Dress professionally and wear ID',
            'Respect client property and privacy',
            'Communicate clearly and politely',
            'Report any issues or concerns promptly',
            'Complete all required documentation'
          ]
        },
        {
          title: 'Quality Assurance',
          description: 'Delivering excellent service:',
          items: [
            'Follow all job checklists completely',
            'Pay attention to detail',
            'Document pre-existing issues',
            'Take before/after photos when appropriate',
            'Report any problems immediately',
            'Seek feedback and continuous improvement'
          ]
        },
        {
          title: 'Environmental Responsibility',
          description: 'Protecting the environment:',
          items: [
            'Use eco-friendly products where possible',
            'Minimize water and energy usage',
            'Dispose of waste properly',
            'Recycle when facilities available',
            'Avoid overuse of chemicals',
            'Report environmental concerns'
          ]
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Useful Information</h1>
            <p className="text-gray-600">Safety guidelines, procedures, and references</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium mb-1">Important Safety Information</p>
            <p className="text-sm text-blue-800">
              This section contains essential health, safety, and work guidance. Please review
              all sections and contact your supervisor if you have any questions.
            </p>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="space-y-4">
        {infoSections.map((section) => (
          <div
            key={section.id}
            className={`bg-white border ${section.borderColor} rounded-xl shadow-sm overflow-hidden`}
          >
            {/* Section Header */}
            <div
              className={`${section.bgColor} p-4 cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={section.color}>
                    {section.icon}
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg">{section.title}</h2>
                </div>
                <div className={section.color}>
                  {expandedSection === section.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Section Content */}
            {expandedSection === section.id && (
              <div className="p-6 space-y-6">
                {section.content.map((subsection, index) => (
                  <div key={index} className={index > 0 ? 'border-t border-gray-200 pt-6' : ''}>
                    <h3 className="font-bold text-gray-900 mb-2">{subsection.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{subsection.description}</p>

                    {/* Items List */}
                    {subsection.items && (
                      <ul className="space-y-2">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Links */}
                    {subsection.links && (
                      <div className="space-y-2 mt-3">
                        {subsection.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>{link.label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Future Features Note */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium mb-1">Coming Soon</p>
            <p className="text-sm text-gray-600">
              Training modules, onboarding materials, and additional resources will be added
              to this section in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
