// Election Types and Subtypes Configuration

const ELECTION_TYPES = {
  LOK_SABHA: 'Lok Sabha',
  RAJYA_SABHA: 'Rajya Sabha',
  STATE_ASSEMBLY: 'State Assembly',
  LOCAL_BODY: 'Local Body',
  PRESIDENTIAL: 'Presidential'
};

const ELECTION_SUBTYPES = {
  LOK_SABHA: ['General', 'By-Election'],
  RAJYA_SABHA: ['Regular', 'By-Election'],
  STATE_ASSEMBLY: ['General', 'Re-Poll'],
  LOCAL_BODY: ['Panchayat', 'Municipal', 'Ward'],
  PRESIDENTIAL: ['Regular', 'Re-Election']
};

// Helper function to get subtypes for a given type
const getSubtypesForType = (type) => {
  return ELECTION_SUBTYPES[type] || [];
};

// Helper function to validate election type and subtype
const validateElectionType = (type, subtype) => {
  if (!type) return true; // Type is optional
  
  const validTypes = Object.values(ELECTION_TYPES);
  if (!validTypes.includes(type)) {
    return { valid: false, error: 'Invalid election type' };
  }

  if (subtype) {
    const typeKey = Object.keys(ELECTION_TYPES).find(key => ELECTION_TYPES[key] === type);
    const validSubtypes = ELECTION_SUBTYPES[typeKey] || [];
    if (!validSubtypes.includes(subtype)) {
      return { valid: false, error: 'Invalid election subtype for this type' };
    }
  }

  return { valid: true };
};

module.exports = {
  ELECTION_TYPES,
  ELECTION_SUBTYPES,
  getSubtypesForType,
  validateElectionType
};
