/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
describe("cordova compass bridge", function () {
    var geo = ripple('geo'),
        target,
        bridge = ripple('emulatorBridge'),
        heading = {direction: "southish"};

    beforeEach(function () {
        spyOn(geo, "getPositionInfo").andReturn({
            heading: heading
        });

        spyOn(bridge, "window").andReturn({
            CompassHeading: function (m, t, a) {
                return {
                    magneticHeading: m,
                    trueHeading: t,
                    headingAccuracy: a,
                    timestamp: 1
                };
            }
        });

        spyOn(window, "setInterval").andReturn(1);
        spyOn(window, "clearInterval");

        target = ripple('platform/cordova/2.0.0/bridge/compass');
    });

    afterEach(function () {
        target.stop();
    });

    describe("when calling getHeading", function () {
        it("it returns the heading from geo", function () {
            var success = jasmine.createSpy("success");

            target.getHeading(success);

            expect(geo.getPositionInfo).toHaveBeenCalled();
            expect(success).toHaveBeenCalledWith({
                magneticHeading: heading,
                trueHeading: heading,
                headingAccuracy: 100,
                timestamp: jasmine.any(Number)
            });
        });
    });

    describe("when starting", function () {
        it("starts an interval", function () {
            var s = jasmine.createSpy("success"),
                f = jasmine.createSpy("fail");

            target.start(s, f);
            expect(window.setInterval).toHaveBeenCalledWith(jasmine.any(Function), 50);
        });

        it("the interval function calls the success callback with the AccelerometerInfoChangedEvent", function () {
            var s = jasmine.createSpy("success"),
                f = jasmine.createSpy("fail");

            target.start(s, f);

            window.setInterval.mostRecentCall.args[0]();

            expect(geo.getPositionInfo).toHaveBeenCalled();
            expect(s).toHaveBeenCalledWith({
                magneticHeading: heading,
                trueHeading: heading,
                headingAccuracy: 100,
                timestamp: jasmine.any(Number)
            });

            expect(f).not.toHaveBeenCalled();
        });
    });

    describe("when stopping", function () {
        it("it clears the interval", function () {
            var s = jasmine.createSpy("success"),
                f = jasmine.createSpy("fail");

            target.start(s, f);
            target.stop();

            expect(window.clearInterval).toHaveBeenCalledWith(1);
        });
    });
});
