function KALMAN(Q_metres_per_second) {

  this.MinAccuracy = 1;
  this.TimeStamp_milliseconds;
  this.x;
  this.y;
  this.variance = -1; // P matrix.  Negative means object uninitialised.  NB: units irrelevant, as long as same units used throughout
  this.Q_metres_per_second = Q_metres_per_second;

  this.TimeStamp = function() { return this.TimeStamp_milliseconds; }
	this.x_filtered = function() { return this.x; }
	this.y_filtered = function() { return this.y; }
	this.accuracy = function() { return Math.sqrt(this.variance); }

  this.Process = function(x_measurement, y_measurement, accuracy, TimeStamp_milliseconds)
	{
	    if (accuracy < this.MinAccuracy) accuracy = this.MinAccuracy;
	    if (this.variance < 0)
	    {
	        // if variance < 0, object is unitialised, so initialise with current values
	        this.TimeStamp_milliseconds = TimeStamp_milliseconds;
	        this.x = x_measurement; this.y = y_measurement;
	        this.variance = accuracy * accuracy;
	    }
	    else
	    {
	        // else apply Kalman filter methodology

	        let TimeInc_milliseconds = TimeStamp_milliseconds - this.TimeStamp_milliseconds;
	        if (TimeInc_milliseconds > 0)
	        {
	            // time has moved on, so the uncertainty in the current position increases
	            this.variance += TimeInc_milliseconds * this.Q_metres_per_second * this.Q_metres_per_second / 1000;
	            this.TimeStamp_milliseconds = TimeStamp_milliseconds;
	            // TO DO: USE VELOCITY INFORMATION HERE TO GET A BETTER ESTIMATE OF CURRENT POSITION
	        }

	        // Kalman gain matrix K = Covarariance * Inverse(Covariance + MeasurementVariance)
	        // NB: because K is dimensionless, it doesn't matter that variance has different units to x and y
	        let K = this.variance / (this.variance + accuracy * accuracy);
	        // apply K
	        this.x += K * (x_measurement - this.x);
	        this.y += K * (y_measurement - this.y);
	        // new Covarariance  matrix is (IdentityMatrix - K) * Covarariance
	        this.variance = (1 - K) * this.variance;
	    }
	}
}
