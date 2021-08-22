def SolarAzEl(jd: number, Lat: number, Lon: number, Alt: number):
    # jd = julian_day(utc_time_point)
    d = jd - 2451543.5
    # Keplerian Elements for the Sun(geocentric)
    w = 282.9404 + 4.70935e-5 * d
    # (longitude of perihelion degrees)
    # a = 1.000000; % (mean distance, a.u.)
    e = 0.016709 - 1.151e-9 * d
    # (eccentricity)
    M = (356.0470 + 0.9856002585 * d % 360.0)
    # (mean anomaly degrees)
    L = w + M
    # (Sun's mean longitude degrees)
    oblecl = 23.4393 - 3.563e-7 * d
    # (Sun's obliquity of the ecliptic)
    # auxiliary angle
    E = M + (180 / M_PI) * e * Math.sin(M * (M_PI / 180)) * (1 + e * Math.cos(M * (M_PI / 180)))
    # rectangular coordinates in the plane of the ecliptic(x axis toward perhilion)
    x = Math.cos(E * (M_PI / 180)) - e
    y = Math.sin(E * (M_PI / 180)) * Math.sqrt(1 - Math.pow(e, 2))
    # find the distance and true anomaly
    r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
    v = Math.atan2(y, x) * (180 / M_PI)
    # find the longitude of the sun
    lon = v + w
    # compute the ecliptic rectangular coordinates
    xeclip = r * Math.cos(lon * (M_PI / 180))
    yeclip = r * Math.sin(lon * (M_PI / 180))
    zeclip = 0.0
    # rotate these coordinates to equitorial rectangular coordinates
    xequat = xeclip
    yequat = yeclip * Math.cos(oblecl * (M_PI / 180)) + zeclip * Math.sin(oblecl * (M_PI / 180))
    zequat = yeclip * Math.sin(23.4406 * (M_PI / 180)) + zeclip * Math.cos(oblecl * (M_PI / 180))
    # convert equatorial rectangular coordinates to RA and Decl:
    r = Math.sqrt(Math.pow(xequat, 2) + Math.pow(yequat, 2) + Math.pow(zequat, 2)) - (Alt / 149598000)
    # roll up the altitude correction
    RA = Math.atan2(yequat, xequat) * (180 / M_PI)
    delta = Math.asin(zequat / r) * (180 / M_PI)
    # Following the RA DEC to Az Alt conversion sequence explained here :
    # http ://www.stargazing.net/kepler/altaz.html
    # Find the J2000 value
    # J2000 = jd - 2451545.0;
    # hourvec = datevec(UTC);
    # UTH = hourvec(:, 4) + hourvec(:, 5) / 60 + hourvec(:, 6) / 3600;
    # hour = utc_time_point.hour
    # minutes = utc_time_point.minute
    # seconds = utc_time_point.second
    # UTH = hour + minutes / 60 + seconds / 3600
    UTH = (jd - int(jd)) * 24 + 11
    # UTC Hora de verão é + 11 Inverno + 12
    # Calculate local siderial time
    GMST0 = (L + 180 % 360.0) / 15
    SIDTIME = GMST0 + UTH + Lon / 15
    # Replace RA with hour angle HA
    HA = (SIDTIME * 15 - RA)
    # convert to rectangular coordinate system
    x = Math.cos(HA * (M_PI / 180)) * Math.cos(delta * (M_PI / 180))
    y = Math.sin(HA * (M_PI / 180)) * Math.cos(delta * (M_PI / 180))
    z = Math.sin(delta * (M_PI / 180))
    # rotate this along an axis going east - west.
    xhor = x * Math.cos((90 - Lat) * (M_PI / 180)) - z * Math.sin((90 - Lat) * (M_PI / 180))
    yhor = y
    zhor = x * Math.sin((90 - Lat) * (M_PI / 180)) + z * Math.cos((90 - Lat) * (M_PI / 180))
    # Find the h and AZ
    Az = Math.atan2(yhor, xhor) * (180 / M_PI) + 180
    El = Math.asin(zhor) * (180 / M_PI)
    return [Az, El]
M_PI = 3.141592653589793
# serial.writeNumber(M_PI)
# basic.showNumber(M_PI)
jd2 = 2459448.3615972223
AzEl = SolarAzEl(jd2, 37.106203, -8.198446, 16)
basic.show_string("" + str(AzEl[0]) + " " + str(AzEl[1]))

def on_forever():
    pass
basic.forever(on_forever)
