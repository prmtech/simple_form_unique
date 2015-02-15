# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "simple_form_unique/version"

Gem::Specification.new do |s|
  s.name        = "simple_form_unique"
  s.version     = SimpleFormUnique::VERSION
  s.authors     = ["Peter Ragone"]
  s.email       = ["peter@prmtech.com"]
  s.homepage    = "http://github.com/pcragone/simple_form_unique"
  s.summary     = "Adds unique inputs to the simple_form library"
  s.description = "Adds unique inputs to the simple_form library"

  s.rubyforge_project = "simple_form_unique"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  # specify any dependencies here; for example:
  # s.add_development_dependency "rspec"
  s.add_runtime_dependency "rails", ">= 3.1"
  s.add_runtime_dependency "simple_form", ">= 1.5.1"
  s.add_runtime_dependency "jquery-rails", ">= 1.0.14"
  
end
