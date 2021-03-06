const M_PI = 3.141592653589793
const jd = 2459428 //1 de agosto 2021, 12:00:00

// basic.showNumber(M_PI)

//serial.writeValue("JD", jd)
//let AzEl = SolarAzEl(jd, 37.106203, -8.198446, 16)
//basic.showString("" + AzEl[0] + " " + AzEl[1])




function SolarAzEl (jd: number, Lat: number, Lon: number, Alt: number) {
    //jd = julian_day(utc_time_point)
    //serial.writeLine("AzEl")
    let d = jd - 2451543.5

	//Keplerian Elements for the Sun(geocentric)
	let w = 282.9404 + 4.70935e-5 * d //(longitude of perihelion degrees)
	// a = 1.000000; % (mean distance, a.u.)

    let e = 0.016709 - 1.151e-9 * d //(eccentricity)
    let M = (356.0470 + 0.9856002585 * d % 360.0)  //(mean anomaly degrees)

    let L = w + M //(Sun's mean longitude degrees)

	let oblecl = 23.4393 - 3.563e-7 * d  //(Sun's obliquity of the ecliptic)

	// auxiliary angle
	let E = M + (180 / M_PI) * e * Math.sin(M * (M_PI / 180)) * (1 + e * Math.cos(M * (M_PI / 180)))

	// rectangular coordinates in the plane of the ecliptic(x axis toward perhilion)
	let x = Math.cos(E * (M_PI / 180)) - e
	let y = Math.sin(E * (M_PI / 180)) * Math.sqrt(1 - Math.pow(e, 2))

	// find the distance and true anomaly
	let r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
	let v = Math.atan2(y, x) * (180 / M_PI)

	// find the longitude of the sun
	let lon = v + w

	// compute the ecliptic rectangular coordinates
	let xeclip = r * Math.cos(lon * (M_PI / 180))
	let yeclip = r * Math.sin(lon * (M_PI / 180))
	let zeclip = 0.0

	//rotate these coordinates to equitorial rectangular coordinates
	let xequat = xeclip

	let yequat = yeclip * Math.cos(oblecl * (M_PI / 180)) + zeclip * Math.sin(oblecl * (M_PI / 180))

	let zequat = yeclip * Math.sin(23.4406 * (M_PI / 180)) + zeclip * Math.cos(oblecl * (M_PI / 180))
	// convert equatorial rectangular coordinates to RA and Decl:
    r = Math.sqrt(Math.pow(xequat, 2) + Math.pow(yequat, 2) + Math.pow(zequat, 2)) - (Alt / 149598000) //roll up the altitude correction
	let RA = Math.atan2(yequat, xequat) * (180 / M_PI)

	let delta = Math.asin(zequat / r) * (180 / M_PI)

	//Following the RA DEC to Az Alt conversion sequence explained here :
	//http ://www.stargazing.net/kepler/altaz.html
	//	Find the J2000 value
	//	J2000 = jd - 2451545.0;
	//hourvec = datevec(UTC);
	//UTH = hourvec(:, 4) + hourvec(:, 5) / 60 + hourvec(:, 6) / 3600;


	//hour = utc_time_point.hour
	//minutes = utc_time_point.minute
	//seconds = utc_time_point.second

	//UTH = hour + minutes / 60 + seconds / 3600

    let UTH = (jd - Math.trunc(jd)) * 24 + 12 //UTC Hora de ver??o ?? + 11 Inverno + 12
    
	// Calculate local siderial time
    let GMST0 = (L + 180 % 360.0) / 15

    let SIDTIME = GMST0 + UTH + Lon / 15
   
	// Replace RA with hour angle HA
    let HA = (SIDTIME * 15 - RA)

	// convert to rectangular coordinate system
    x = Math.cos(HA * (M_PI / 180)) * Math.cos(delta * (M_PI / 180))

    y = Math.sin(HA * (M_PI / 180)) * Math.cos(delta * (M_PI / 180))
    let z = Math.sin(delta * (M_PI / 180))

	// rotate this along an axis going east - west.
    let xhor = x * Math.cos((90 - Lat) * (M_PI / 180)) - z * Math.sin((90 - Lat) * (M_PI / 180))

    let yhor = y
    let zhor = x * Math.sin((90 - Lat) * (M_PI / 180)) + z * Math.cos((90 - Lat) * (M_PI / 180))

	// Find the h and AZ
    
    let Az = Math.atan2(yhor, xhor) * (180 / M_PI) + 180
    let El = Math.asin(zhor) * (180 / M_PI)
    return [Az, El]
}

basic.forever(function () {
	do {
        control.waitMicros(50000)
        input.onButtonPressed(Button.A, () => {
            input.calibrateCompass();
        })
        basic.clearScreen()
        led.plot(2, Math.floor(input.rotation(Rotation.Pitch)*5/10)+2)
        serial.writeLine(input.rotation(Rotation.Roll) + ";" + (input.compassHeading() - 90.0 - 1.33))
    }
    while( input.buttonIsPressed(Button.B)==false)
    let El=0.0
    let Az = 0.0
    for (let i = 0; i <10; i++){
        El += input.rotation(Rotation.Roll)
        Az += input.compassHeading()
        basic.showNumber(10-i)
    }
    El = El/10.0
    Az = Math.abs(Az/10.0 -90.0 -1.33) //1.33w declina????o magn??tica
    
    serial.writeLine("Az_m = " + Az + " El_m = " + El)
    
    //control.waitMicros(40000000)
    //[chi2, dia, hora, minuto]
    let chi2_data_lst = [[20000, 0, 0, 0], [20000, 0, 0, 0], [20000, 0, 0, 0], [20000, 0, 0, 0]]
    let chi2_data2_lst = [[20000, 0, 0, 0], [20000, 0, 0, 0], [20000, 0, 0, 0], [20000, 0, 0, 0]]
    let chi2_lst = []
    let d = 0
    let h = 0
    let m = 0
    let s = 0

    for (d = 25; d < 26; d++){
       basic.showNumber(d)
       for (h = -8; h < 9; h++) {
            for (m = 0; m < 60; m += 10) {
                let jd_i = jd + d + (h + m / 60) / 24
                let AzEl_p = SolarAzEl(jd_i, 37.106203, -8.198446, 53)
                let chi2 = (Az - AzEl_p[0]) ** 2 + (El - AzEl_p[1]) ** 2
                //serial.writeLine("Time = " + d + " - " + h + ":" + m + ":" + s + " --- chi2 = " + chi2)
                //if (chi2 < 2) {
                chi2_data_lst.set(3,[chi2,d,h,m])
                chi2_data_lst.sort(function (a, b) { return a[0] - b[0] })
                //}
            }
         } 
    }
    serial.writeNumbers(chi2_data_lst[0])

    chi2_data_lst.forEach (el=>{ 
        for (m = -5; m < 6; m++) {
            let jd_i = jd + el[1] + (el[2] + (el[3] + m) / 60) / 24
            let AzEl_p = SolarAzEl(jd_i, 37.106203, -8.198446, 53)
            let chi2 = (Az - AzEl_p[0]) ** 2 + (El- AzEl_p[1]) ** 2
            //serial.writeLine("Time = " + d + " - " + h + ":" + m + ":" + s + " --- chi2 = " + chi2)
            //if (chi2 < .02) {
            chi2_data2_lst.set(3, [chi2, el[1], el[2], (el[3]+m)])
            chi2_data2_lst.sort(function (a, b) { return a[0] - b[0] })
            //}
        }
    })

   /* chi2_data2_lst.forEach(el => {
        for (s = -30; s < 31; s++) {
            let jd_i = el[1] + s / 3600 / 24
            let AzEl_p = SolarAzEl(jd_i, 37.106203, -8.198446, 53)
            let chi2 = (Az - AzEl_p[0]) ** 2 + (El - AzEl_p[1]) ** 2
            
        }
    }) */
    
    serial.writeLine("Encontrou ")
    chi2_data2_lst.forEach(el => {
        //basic.showString("JD = " + chi2_data_lst[i])
        
        serial.writeLine("Chi2 = " + el[0] + " --- dia " + (1 + el[1]) + " --- " + (el[2]+12) + ":" + (el[3]) + "(UTC)")
       // serial.writeNumbers(chi2_data_lst)
  
    })  
   
})
