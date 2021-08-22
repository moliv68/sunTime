function SolarAzEl (jd: number, Lat: number, Lon: number, Alt: number) {
    //jd = julian_day(utc_time_point)

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

    let UTH = (jd - Math.trunc(jd)) * 24 + 11 //UTC Hora de verão é + 11 Inverno + 12

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

const M_PI = 3.141592653589793
// serial.writeNumber(M_PI)
// basic.showNumber(M_PI)
let jd = 2459448.3615972223
let AzEl = SolarAzEl(jd, 37.106203, -8.198446, 16)
basic.showString("" + AzEl[0] + " " + AzEl[1])
basic.forever(function () {
	
})
