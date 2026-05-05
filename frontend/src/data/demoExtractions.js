// Pre-extracted demo data from real verified cases.
// Each entry has a `match` array of filename substrings (case-insensitive)
// and a `result` shaped exactly like the live API response.

export const DEMO_EXTRACTIONS = [
  {
    // High Court of Orissa — CRLMC No.2198 of 2025 (chargesheet quashing)
    match: ['crlmc', 'orissa', 'chargesheet', 'angul', '2198', 'banarpal'],
    fileName: 'CRLMC_2198_2025_Orissa_HC.pdf',
    result: {
      success: true,
      data: {
        case_metadata: {
          case_number: 'CRLMC No.2198 of 2025',
          court_name:  'High Court of Orissa at Cuttack',
          order_date:  '01-05-2026',
          order_type:  'FINAL_DISPOSAL',
        },
        directions: [
          {
            verbatim_text:      'As such, in exercise of its inherent powers under section 528 of the BNSS (erstwhile section 482 of Cr.P.C), in order to secure the ends of justice, this Court deems it proper to quash the impugned Chargesheet C.S No.270 at Annexure-2 and the subsequent criminal proceeding emanating therefrom, so far as the present Petitioner is concerned. Accordingly, the same are hereby quashed.',
            category:           'BINDING_TO_GOVT',
            responsible_entity: 'Court of Ad hoc Additional District & Sessions Judge (FTSC), Angul, and Banarpal Police Station',
            original_timeline:  'hereby quashed',
            calculated_deadline_days: 30,
            confidence_score:   'HIGH',
          },
          {
            verbatim_text:      'The CRLMC petition is allowed.',
            category:           'OBSERVATION',
            responsible_entity: null,
            original_timeline:  null,
            calculated_deadline_days: null,
            confidence_score:   'HIGH',
          },
          {
            verbatim_text:      'However, there shall be no order as to costs.',
            category:           'OBSERVATION',
            responsible_entity: null,
            original_timeline:  null,
            calculated_deadline_days: null,
            confidence_score:   'HIGH',
          },
        ],
        summary: {
          total_directions:        3,
          binding_to_govt:         1,
          to_petitioner:           0,
          observations:            2,
          high_confidence:         3,
          requires_immediate_action: 1,
        },
      },
    },
  },
  {
    // High Court of Karnataka — WP No. 1209 of 2025 (Silk Board superannuation)
    match: ['silk', 'superannuation', '1209', 'farm_worker', 'farm-worker', 'farmworker', 'karnataka_hc', 'wp_1209'],
    fileName: 'WP_1209_2025_Karnataka_HC_SilkBoard.pdf',
    result: {
      success: true,
      data: {
        case_metadata: {
          case_number: 'WP No. 1209 of 2025',
          court_name:  'High Court of Karnataka at Bengaluru',
          order_date:  '23-07-2025',
          order_type:  'FINAL_DISPOSAL',
        },
        directions: [
          {
            verbatim_text:      "It is declared that the petitioner's age of superannuation is 60 years.",
            category:           'OBSERVATION',
            responsible_entity: null,
            original_timeline:  null,
            calculated_deadline_days: null,
            confidence_score:   'HIGH',
          },
          {
            verbatim_text:      'The respondents shall not superannuate the petitioner treating the age of retirement as 59.',
            category:           'BINDING_TO_GOVT',
            responsible_entity: 'Respondents (Central Silk Board and its officers)',
            original_timeline:  null,
            calculated_deadline_days: null,
            confidence_score:   'HIGH',
          },
          {
            verbatim_text:      'The petitioner is entitled to continue in employment as Timescale Farm Workers under first respondent till the age of superannuation at 60 subject to all Rules and Regulations applicable to the employment of the petitioner.',
            category:           'BINDING_TO_GOVT',
            responsible_entity: 'Respondent No.1 (Central Silk Board)',
            original_timeline:  'till the age of superannuation at 60',
            calculated_deadline_days: null,
            confidence_score:   'HIGH',
          },
          {
            verbatim_text:      'The prayer for grant of service benefits for the period from 58 to 60 years cannot be granted at this stage as the petitioner is yet to complete 60 years of service.',
            category:           'OBSERVATION',
            responsible_entity: null,
            original_timeline:  'at this stage',
            calculated_deadline_days: null,
            confidence_score:   'HIGH',
          },
          {
            verbatim_text:      'The payment of service benefits period from 58 to 60 years shall be subject to the terms and conditions applicable to the employment under respondent No.1.',
            category:           'BINDING_TO_GOVT',
            responsible_entity: 'Respondent No.1 (Central Silk Board)',
            original_timeline:  null,
            calculated_deadline_days: null,
            confidence_score:   'HIGH',
          },
        ],
        summary: {
          total_directions:        5,
          binding_to_govt:         3,
          to_petitioner:           0,
          observations:            2,
          high_confidence:         5,
          requires_immediate_action: 0,
        },
      },
    },
  },
]

/**
 * Returns the best matching demo extraction for a given filename,
 * or null if no match is found.
 */
export function findDemoExtraction(fileName) {
  if (!fileName) return null
  const lower = fileName.toLowerCase()
  return DEMO_EXTRACTIONS.find(d => d.match.some(keyword => lower.includes(keyword))) ?? null
}
