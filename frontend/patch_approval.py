import re

filepath = r'd:\ATM-WMS\frontend\src\components\ApprovalWorkflow\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace totalOt with details globally
content = content.replace('totalOt:', 'details:')
content = content.replace('wf.totalOt', 'wf.details')
content = content.replace('selectedReport?.totalOt', 'selectedReport?.details')
content = content.replace('Total OT / Amount', 'Details / Amount')
content = content.replace('Total OT:', 'Details:')

# Rewrite fetchRecords and submitAction
fetch_start = content.find('const fetchRecords = async () => {')
fetch_end = content.find('  useEffect(() => {')

submit_start = content.find('const submitAction = async () => {')
submit_end = content.find('  return (')

if fetch_start != -1 and fetch_end != -1 and submit_start != -1 and submit_end != -1:
    new_fetch = """const fetchRecords = async () => {
    try {
      const [otRes, leavesRes, earlyRes] = await Promise.all([
        fetch('http://localhost:8000/overtime/'),
        fetch('http://localhost:8000/leaves/'),
        fetch('http://localhost:8000/early-departures/')
      ]);

      const otData = otRes.ok ? await otRes.json() : [];
      const leavesData = leavesRes.ok ? await leavesRes.json() : [];
      const earlyData = earlyRes.ok ? await earlyRes.json() : [];

      const mappedOT = otData.map(rec => {
        let stage = 'Supervisor';
        let wfStatus = 'Pending';
        if (rec.status === 'Pending Supervisor') { stage = 'Supervisor'; wfStatus = 'Pending'; }
        else if (rec.status === 'Pending Admin' || rec.status === 'Pending Submission') { stage = 'Superadmin'; wfStatus = 'Pending'; }
        else if (rec.status === 'Approved') { stage = 'Payroll'; wfStatus = 'Approved'; }
        else if (rec.status === 'Paid') { stage = 'Completed'; wfStatus = 'Paid'; }
        else if (rec.status === 'Rejected') { stage = 'Closed'; wfStatus = 'Rejected'; }
        else { stage = 'Superadmin'; wfStatus = rec.status; }
        
        return {
          id: rec.id,
          reportId: OT-,
          type: 'overtime',
          empName: rec.name,
          period: rec.date,
          details: ${rec.submittedOtHours || 0} hrs,
          totalAmount: $,
          currentStage: stage,
          status: wfStatus,
          originalRecord: rec,
          history: []
        };
      });

      const mappedLeaves = leavesData.map(rec => {
        let stage = 'Supervisor';
        let wfStatus = 'Pending';
        if (rec.status === 'Pending') { stage = 'Supervisor'; wfStatus = 'Pending'; }
        else if (rec.status === 'Approved') { stage = 'Completed'; wfStatus = 'Approved'; }
        else if (rec.status === 'Rejected') { stage = 'Closed'; wfStatus = 'Rejected'; }
        else { stage = 'Superadmin'; wfStatus = rec.status; }

        return {
          id: rec.id,
          reportId: LV-,
          type: 'leave',
          empName: rec.name,
          period: ${rec.startDate} to ,
          details: rec.leaveType,
          totalAmount: '-',
          currentStage: stage,
          status: wfStatus,
          originalRecord: rec,
          history: []
        };
      });

      const mappedEarly = earlyData.map(rec => {
        let stage = 'Supervisor';
        let wfStatus = 'Pending';
        if (rec.status === 'Pending') { stage = 'Supervisor'; wfStatus = 'Pending'; }
        else if (rec.status === 'Approved') { stage = 'Completed'; wfStatus = 'Approved'; }
        else if (rec.status === 'Rejected') { stage = 'Closed'; wfStatus = 'Rejected'; }
        else { stage = 'Superadmin'; wfStatus = rec.status; }

        return {
          id: rec.id,
          reportId: ED-,
          type: 'early_departure',
          empName: rec.name,
          period: rec.date,
          details: rec.departureTime,
          totalAmount: '-',
          currentStage: stage,
          status: wfStatus,
          originalRecord: rec,
          history: []
        };
      });

      setWorkflows([...mappedOT, ...mappedLeaves, ...mappedEarly]);
    } catch (err) {
      console.error('Error fetching workflows:', err);
    }
  };
"""

    new_submit = """const submitAction = async () => {
    let newDbStatus = selectedReport.originalRecord.status;
    let url = '';
    let payload = { ...selectedReport.originalRecord };
    
    if (selectedReport.type === 'overtime') {
      url = http://localhost:8000/overtime/;
      let adminApprovedOt = selectedReport.originalRecord.adminApprovedOt;
      let supervisorReviewedOt = selectedReport.originalRecord.supervisorReviewedOt;
      let paidOtHours = selectedReport.originalRecord.paidOtHours;
      
      if (actionType === 'approve') {
        if (activeRole === 'Supervisor') {
          newDbStatus = 'Pending Admin';
          supervisorReviewedOt = selectedReport.originalRecord.submittedOtHours;
        } else if (activeRole === 'Superadmin') {
          newDbStatus = 'Approved';
          adminApprovedOt = selectedReport.originalRecord.submittedOtHours;
        } else if (activeRole === 'Payroll') {
          newDbStatus = 'Paid';
          paidOtHours = adminApprovedOt;
        }
      } else if (actionType === 'return' || actionType === 'reject') {
        newDbStatus = 'Rejected';
      }
      payload.status = newDbStatus;
      payload.supervisorReviewedOt = supervisorReviewedOt;
      payload.adminApprovedOt = adminApprovedOt;
      payload.paidOtHours = paidOtHours;

    } else if (selectedReport.type === 'leave') {
      url = http://localhost:8000/leaves/;
      if (actionType === 'approve') newDbStatus = 'Approved';
      else newDbStatus = 'Rejected';
      payload.status = newDbStatus;

    } else if (selectedReport.type === 'early_departure') {
      url = http://localhost:8000/early-departures/;
      if (actionType === 'approve') newDbStatus = 'Approved';
      else newDbStatus = 'Rejected';
      payload.status = newDbStatus;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchRecords();
        closeActionModal();
      } else {
        console.error('Error updating status');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  """

    # We need to assemble the file
    final_content = content[:fetch_start] + new_fetch + "\n  " + content[fetch_end:submit_start] + new_submit + content[submit_end:]
    
    # Fix the template string issue for PS evaluation
    final_content = final_content.replace('OT-', 'OT-')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)
else:
    print("Could not find blocks")
