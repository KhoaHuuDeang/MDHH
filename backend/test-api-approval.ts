import axios from 'axios';

async function testApproval() {
  const uploadId = '80328f2a-5735-4fc0-a142-ecd6b8dac15e'; // PENDING_APPROVAL upload
  
  try {
    // Approve endpoint
    const response = await axios.patch(
      `http://localhost:3001/admin/moderation/uploads/${uploadId}/approve`,
      {},
      {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }
    );
    
    console.log('Approval response:', response.data);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testApproval();
