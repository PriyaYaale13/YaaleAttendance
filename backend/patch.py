with open('main.py', 'a', encoding='utf8') as f:
    f.write('''
from datetime import datetime
@app.post('/attendance/scan/', response_model=schemas.AttendanceResponse)
def scan_attendance(scan: schemas.AttendanceScan, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.employee_id == scan.employeeId).first()
    if not emp: raise HTTPException(status_code=404, detail='Employee not found')
    today_str = datetime.now().strftime('%Y-%m-%d')
    time_str = datetime.now().strftime('%I:%M %p')
    att = db.query(models.Attendance).filter(models.Attendance.employee_id == scan.employeeId, models.Attendance.date == today_str).first()
    if not att:
        new_att = models.Attendance(employee_id=scan.employeeId, date=today_str, in_time=time_str, out_time=None)
        db.add(new_att); db.commit(); db.refresh(new_att)
        return schemas.AttendanceResponse(id=new_att.id, employeeId=new_att.employee_id, date=new_att.date, inTime=new_att.in_time, outTime=new_att.out_time, workingHours=new_att.working_hours, name=emp.full_name)
    else:
        if att.out_time: raise HTTPException(status_code=400, detail=f'{scan.employeeId} has already clocked out for today.')
        att.out_time = time_str
        try:
            in_t = datetime.strptime(att.in_time, '%I:%M %p')
            out_t = datetime.strptime(time_str, '%I:%M %p')
            hours = (out_t - in_t).total_seconds() / 3600
            att.working_hours = f'{hours:.2f} hrs'
        except:
            att.working_hours = 'N/A'
        db.commit(); db.refresh(att)
        return schemas.AttendanceResponse(id=att.id, employeeId=att.employee_id, date=att.date, inTime=att.in_time, outTime=att.out_time, workingHours=att.working_hours, name=emp.full_name)
@app.get('/attendance/', response_model=List[schemas.AttendanceResponse])
def get_attendance(db: Session = Depends(get_db)):
    records = db.query(models.Attendance).all()
    result = []
    for r in records:
        emp = db.query(models.Employee).filter(models.Employee.employee_id == r.employee_id).first()
        result.append(schemas.AttendanceResponse(id=r.id, employeeId=r.employee_id, date=r.date, inTime=r.in_time, outTime=r.out_time, workingHours=r.working_hours, name=emp.full_name if emp else 'Unknown'))
    return result
''')

