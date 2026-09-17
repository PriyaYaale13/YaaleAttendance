import re

filepath = r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert TimePicker component
timepicker_code = """
const TimePicker = ({ value, onChange }) => {
  const parts = value ? value.match(/(\d+):(\d+)\s(AM|PM)/) : null;
  const h = parts ? parts[1] : "09";
  const m = parts ? parts[2] : "00";
  const p = parts ? parts[3] : "AM";

  const update = (nh, nm, np) => {
    onChange(${nh}: );
  };

  const hours = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({length: 12}, (_, i) => String(i * 5).padStart(2, '0'));

  return (
    <div className="d-flex gap-2">
      <select className="form-select bg-firo-bg border-0 rounded-3 text-center" value={h} onChange={(e) => update(e.target.value, m, p)}>
        {hours.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <span className="align-self-center fw-bold text-muted">:</span>
      <select className="form-select bg-firo-bg border-0 rounded-3 text-center" value={m} onChange={(e) => update(h, e.target.value, p)}>
        {minutes.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <select className="form-select bg-firo-bg border-0 rounded-3 text-center" value={p} onChange={(e) => update(h, m, e.target.value)}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

"""
content = content.replace("const ShiftHours = () => {", timepicker_code + "const ShiftHours = () => {")

# 2. Update initial form
content = content.replace("startTime: '',", "startTime: '09:00 AM',")
content = content.replace("endTime: '',", "endTime: '05:00 PM',")

# 3. Update the render inputs
old_inputs = '''                      <div className="row mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <label className="form-label text-firo-muted small fw-semibold text-uppercase">Start Time</label>
                          <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-firo-muted small fw-semibold text-uppercase">End Time</label>
                          <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" />
                        </div>
                      </div>'''

new_inputs = '''                      <div className="row mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                          <label className="form-label text-firo-muted small fw-semibold text-uppercase">Start Time</label>
                          <TimePicker value={formData.startTime} onChange={(val) => setFormData({...formData, startTime: val})} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-firo-muted small fw-semibold text-uppercase">End Time</label>
                          <TimePicker value={formData.endTime} onChange={(val) => setFormData({...formData, endTime: val})} />
                        </div>
                      </div>'''

content = content.replace(old_inputs, new_inputs)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
